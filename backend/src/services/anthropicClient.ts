import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

// ─── Configuration ──────────────────────────────────────────────────────────
const DEFAULT_CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";
const CLAUDE_MODELS_TO_TRY = [
    DEFAULT_CLAUDE_MODEL,
    "claude-sonnet-4-6",
    "claude-sonnet-4-5-20250929"
];

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_MODELS_TO_TRY = [
    DEFAULT_GEMINI_MODEL,
    "gemini-2.5-pro"
];

const MAX_RETRIES = 2;
const INITIAL_BACKOFF_MS = 2000;
const MAX_DELAY_MS = 30000;

// ─── Client Initialization ─────────────────────────────────────────────────
let anthropic: Anthropic | null = null;
if (process.env.ANTHROPIC_API_KEY) {
    anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
} else {
    console.warn("ANTHROPIC_API_KEY is not set; Anthropic Claude features will fall back to Gemini or be disabled.");
}

let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} else {
    console.warn("GEMINI_API_KEY is not set; Google Gemini features/fallbacks will be disabled.");
}

export const isAnthropicConfigured = (): boolean => !!anthropic || !!genAI;

// ─── JSON Extraction Helper ────────────────────────────────────────────────
export function extractJsonFromResponse(text: string): string {
    let clean = text.trim();

    // 1. Try to find JSON inside markdown code blocks
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
        return match[1].trim();
    }

    // 2. If no code block, find the first '{' and last '}'
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return clean.substring(firstBrace, lastBrace + 1);
    }

    // 3. Try array format (for explanation responses)
    const firstBracket = clean.indexOf("[");
    const lastBracket = clean.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return clean.substring(firstBracket, lastBracket + 1);
    }

    // 4. Fallback: return original
    return clean;
}

// ─── Direct Providers Calls ────────────────────────────────────────────────

async function callAnthropicDirect(modelName: string, options: ClaudeCallOptions): Promise<string> {
    if (!anthropic) {
        throw new Error("Anthropic client is not configured (ANTHROPIC_API_KEY missing)");
    }
    const { systemPrompt, userPrompt, maxTokens = 1024 } = options;
    const message = await anthropic.messages.create({
        model: modelName,
        max_tokens: maxTokens,
        ...(systemPrompt ? { system: systemPrompt } : {}),
        messages: [
            { role: "user", content: userPrompt },
        ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text content in Claude response");
    }
    return textBlock.text;
}

async function callGeminiDirect(modelName: string, options: ClaudeCallOptions): Promise<string> {
    if (!genAI) {
        throw new Error("Gemini client is not configured (GEMINI_API_KEY missing)");
    }
    const { systemPrompt, userPrompt, maxTokens = 1024 } = options;
    const model = genAI.getGenerativeModel({
        model: modelName,
        ...(systemPrompt ? { systemInstruction: systemPrompt } : {}),
    });

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
            maxOutputTokens: Math.max(maxTokens, 2048),
        }
    });

    const response = await result.response;
    const text = response.text();
    if (!text) {
        throw new Error("No text content in Gemini response");
    }
    return text;
}

// ─── Core API Call ──────────────────────────────────────────────────────────

export interface ClaudeCallOptions {
    /** System prompt */
    systemPrompt?: string;
    /** User prompt content */
    userPrompt: string;
    /** Max tokens for response (default 1024) */
    maxTokens?: number;
    /** Optional label for logging */
    label?: string;
    /** Optional provider override */
    forceProvider?: "anthropic" | "gemini";
}

/**
 * Calls Claude with fallback to Gemini, or forces a provider if configured.
 * Retries on transient errors and rate limits.
 */
export async function callClaude(options: ClaudeCallOptions): Promise<string> {
    const { systemPrompt, userPrompt, maxTokens = 1024, label = "AI", forceProvider } = options;

    let modelsToTry: { modelName: string; provider: 'anthropic' | 'gemini' }[] = [];

    if (forceProvider === 'gemini') {
        const defaultGemini = process.env.GEMINI_MODEL || "gemini-2.5-flash";
        const geminiModels = [defaultGemini, "gemini-2.5-pro"];
        modelsToTry = geminiModels.map(m => ({ modelName: m, provider: 'gemini' }));
    } else if (forceProvider === 'anthropic') {
        const defaultClaude = process.env.CLAUDE_MODEL || "claude-sonnet-5";
        const claudeModels = [defaultClaude, "claude-sonnet-4-6", "claude-sonnet-4-5-20250929"];
        modelsToTry = claudeModels.map(m => ({ modelName: m, provider: 'anthropic' }));
    } else {
        const defaultClaude = process.env.CLAUDE_MODEL || "claude-sonnet-5";
        const defaultGemini = process.env.GEMINI_MODEL || "gemini-2.5-flash";

        const claudeProvider = defaultClaude.startsWith("gemini-") ? "gemini" as const : "anthropic" as const;

        modelsToTry.push({ modelName: defaultClaude, provider: claudeProvider });

        if (claudeProvider === "anthropic") {
            if (defaultClaude !== "claude-sonnet-4-6") {
                modelsToTry.push({ modelName: "claude-sonnet-4-6", provider: "anthropic" });
            }
            if (defaultClaude !== "claude-sonnet-4-5-20250929") {
                modelsToTry.push({ modelName: "claude-sonnet-4-5-20250929", provider: "anthropic" });
            }
        }

        modelsToTry.push({ modelName: defaultGemini, provider: "gemini" });
        if (defaultGemini !== "gemini-2.5-flash") {
            modelsToTry.push({ modelName: "gemini-2.5-flash", provider: "gemini" });
        }
    }

    // Remove duplicates while preserving order
    const seen = new Set<string>();
    const uniqueModelsToTry = modelsToTry.filter(m => {
        const key = `${m.provider}:${m.modelName}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    let lastError: any = null;

    for (const { modelName, provider } of uniqueModelsToTry) {
        let attempt = 0;
        while (attempt <= MAX_RETRIES) {
            try {
                if (provider === "anthropic") {
                    return await callAnthropicDirect(modelName, options);
                } else {
                    return await callGeminiDirect(modelName, options);
                }
            } catch (error: any) {
                lastError = error;

                const errorMessage = error?.message || "";
                const statusCode = error?.status || error?.statusCode;

                console.error(`[${label}] Error with ${modelName} (${provider}) (attempt ${attempt + 1}/${MAX_RETRIES + 1}):`, {
                    message: errorMessage,
                    status: statusCode,
                    name: error?.name,
                });

                // Check for retryable errors (status 429 is rate limit / quota)
                const isRateLimit = statusCode === 429 || errorMessage.includes("429") || errorMessage.includes("rate_limit");
                const isOverloaded = statusCode === 529 || errorMessage.includes("overloaded") || errorMessage.includes("overloaded_error");
                const isServerError = typeof statusCode === "number" && statusCode >= 500 && statusCode < 600;
                const isNetworkError = ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(error?.code);
                const isRetryable = isRateLimit || isOverloaded || isServerError || isNetworkError;

                if (isRetryable) {
                    attempt++;
                    if (attempt <= MAX_RETRIES) {
                        const delayTime = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1), MAX_DELAY_MS);
                        console.warn(`[${label}] Retry ${attempt}/${MAX_RETRIES} for ${modelName} (${provider}) in ${delayTime}ms`);
                        await new Promise((resolve) => setTimeout(resolve, delayTime));
                        continue;
                    }
                }

                // Non-retryable error or max retries reached — try next model
                break;
            }
        }
    }

    throw lastError || new Error(`[${label}] All model configurations failed`);
}

/**
 * Calls Claude/Gemini and parses the response as JSON.
 * Returns the parsed object.
 */
export async function callClaudeJSON<T = any>(options: ClaudeCallOptions): Promise<T> {
    const raw = await callClaude(options);
    const cleaned = extractJsonFromResponse(raw);
    try {
        return JSON.parse(cleaned) as T;
    } catch (err: any) {
        console.error(`[callClaudeJSON] Failed to parse JSON. Raw response:`, JSON.stringify(raw));
        console.error(`[callClaudeJSON] Cleaned response:`, JSON.stringify(cleaned));
        throw err;
    }
}
