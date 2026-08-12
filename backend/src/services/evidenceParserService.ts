import AdmZip from "adm-zip";
import dns from "node:dns";
import net from "node:net";

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts[0] === 127 || parts[0] === 10 || parts[0] === 0) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower === "::" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) return true;
    return false;
  }
  return true;
}

async function validateUrlForSsrf(targetUrl: string): Promise<{ safe: boolean; error?: string }> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { safe: false, error: "Invalid URL structure." };
  }

  if (parsed.protocol !== "https:") {
    return { safe: false, error: "Only secure HTTPS Evidence URLs are permitted." };
  }

  const hostname = parsed.hostname;
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      return { safe: false, error: "Access to private/local IP addresses is forbidden." };
    }
  } else {
    try {
      const addresses = await dns.promises.lookup(hostname, { all: true });
      for (const addr of addresses) {
        if (isPrivateIp(addr.address)) {
          return { safe: false, error: "Hostname resolves to a private or forbidden IP address." };
        }
      }
    } catch {
      return { safe: false, error: "Unable to resolve Evidence URL hostname." };
    }
  }

  return { safe: true };
}

export const MAX_ZIP_UNCOMPRESSED_SIZE = 100 * 1024 * 1024; // 100MB

export interface EvidenceParsingResult {
  success: boolean;
  extractedTextLength: number;
  extractedSnippet: string;
  unfilledPlaceholders: string[];
  isValidTemplate: boolean;
  missingRequirements: string[];
  matchedRequirements: string[];
  validationErrors: string[];
  validationWarnings: string[];
  score: number; // 0 - 100
}

/**
 * Extracts clean plain text from a Word .docx file buffer using AdmZip and XML parsing.
 * Preserves spaces and line breaks so words/table cells do not get squished together.
 */
export function extractTextFromDocx(buffer: Buffer): { text: string; error?: string } {
  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const docEntry = zipEntries.find(
      (entry) => entry.entryName === "word/document.xml"
    );
    if (!docEntry) {
      return { text: "" };
    }
    if (docEntry.header.size > MAX_ZIP_UNCOMPRESSED_SIZE) {
      return { text: "", error: "The uncompressed DOCX document size exceeds the limit (100MB)." };
    }
    const xml = docEntry.getData().toString("utf-8");

    // Replace structural OpenXML tags with spaces/newlines to avoid word merging
    const formattedXml = xml
      .replace(/<\/w:p>/gi, "\n")
      .replace(/<\/w:tr>/gi, "\n")
      .replace(/<\/w:tc>/gi, " | ")
      .replace(/<w:br\s*\/?>/gi, "\n")
      .replace(/<w:tab\s*\/?>/gi, "\t");

    // Strip remaining tags with space padding so adjacent run text doesn't merge
    const text = formattedXml
      .replace(/<[^>]+>/g, " ")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&apos;/gi, "'")
      .replace(/&#39;/g, "'");

    // Normalize spacing per line while preserving structural newlines
    const cleanLines = text
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .filter((line) => line.length > 0);

    return { text: cleanLines.join("\n") };
  } catch (err) {
    console.error("[evidenceParser] Failed to extract text from docx:", err);
    return { text: "", error: "Failed to parse DOCX document structure." };
  }
}

/**
 * Extracts text streams from a PDF file buffer natively.
 */
export function extractTextFromPdf(buffer: Buffer): { text: string; error?: string } {
  try {
    const pdfStr = buffer.toString("binary");
    const textMatches: string[] = [];

    // Match text inside parenthesis (text) Tj / TJ or stream text blocks
    const tjRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*(?:Tj|'|")/g;
    let match: RegExpExecArray | null;

    while ((match = tjRegex.exec(pdfStr)) !== null) {
      let rawText = match[1];
      // Decode PDF escape characters
      rawText = rawText
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t")
        .replace(/\\b/g, "\b")
        .replace(/\\f/g, "\f")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")")
        .replace(/\\\\/g, "\\")
        .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));

      if (rawText.trim().length > 0) {
        textMatches.push(rawText);
      }
    }

    // Fallback: search for Array TJ text blocks `[(string)...] TJ`
    if (textMatches.length < 5) {
      const arrayTjRegex = /\[\s*((?:\([^()\\]*(?:\\.[^()\\]*)*\)|[-+]?\d+(?:\.\d+)?|\s+)+)\]\s*TJ/g;
      while ((match = arrayTjRegex.exec(pdfStr)) !== null) {
        const innerStr = match[1];
        const stringParts = innerStr.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/g);
        if (stringParts) {
          const joined = stringParts
            .map((s) => s.slice(1, -1).replace(/\\\(/g, "(").replace(/\\\)/g, ")"))
            .join("");
          if (joined.trim().length > 0) {
            textMatches.push(joined);
          }
        }
      }
    }

    const rawResult = textMatches.join(" ").replace(/[ \t]+/g, " ");
    const cleanLines = rawResult
      .split(/(?:\r?\n)+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return { text: cleanLines.join("\n") };
  } catch (err) {
    console.error("[evidenceParser] Failed to extract text from PDF:", err);
    return { text: "", error: "Failed to parse PDF content stream." };
  }
}

/**
 * Converts raw HTML string (e.g. web page or Google Docs publish link) to clean plain text.
 */
export function extractTextFromHtml(html: string): string {
  if (!html) return "";

  // Strip script and style blocks
  let cleanHtml = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  // Insert line breaks for block tags
  cleanHtml = cleanHtml
    .replace(/<\/(p|div|h[1-6]|li|tr|article|section)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/td>/gi, " | ");

  // Strip remaining HTML tags
  const text = cleanHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'");

  const lines = text
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l) => l.length > 0);

  return lines.join("\n");
}

/**
 * Parses evidence document buffer or string and validates template placeholders & evidence requirements.
 */
const COMMON_STOPWORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't", "as", "at",
  "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can", "cannot", "could",
  "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few", "for",
  "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "just",
  "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or",
  "other", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she", "should", "shouldn't", "so",
  "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "were", "weren't",
  "what", "when", "where", "which", "while", "who", "whom", "why", "with", "would", "wouldn't", "you", "your",
  "yours", "yourself", "yourselves", "brief", "first", "read", "built", "directly", "every", "module", "already",
  "added", "plus", "covers", "full", "application", "testing", "assessment", "feature", "specification",
  "brief", "for", "from", "v1", "round", "team", "this", "covers"
]);

export function extractMeaningfulKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter((k) => k.length >= 4 && !COMMON_STOPWORDS.has(k));
}

export interface ControlContext {
  title?: string;
  statement?: string;
  category?: string;
}

/**
 * Parses evidence document buffer or string and validates template placeholders & evidence requirements.
 */
export function parseAndValidateEvidence(
  fileBuffer: Buffer | null,
  rawTextInput: string | null,
  filename: string | null,
  evidenceRequirements: string[] = [],
  controlContext?: ControlContext
): EvidenceParsingResult {
  let extractedText = "";

  if (rawTextInput && rawTextInput.trim().length > 0) {
    extractedText = rawTextInput.trim();
  } else if (fileBuffer && fileBuffer.length > 0) {
    const isDocx = filename ? /\.docx$/i.test(filename) : true;
    const isPdf = filename ? /\.pdf$/i.test(filename) : false;
    const isTextFile = filename ? /\.(txt|md|json|log|csv)$/i.test(filename) : false;

    if (isDocx && !isPdf && !isTextFile) {
      const docxResult = extractTextFromDocx(fileBuffer);
      if (docxResult.error) {
        return {
          success: false,
          extractedTextLength: 0,
          extractedSnippet: "",
          unfilledPlaceholders: [],
          isValidTemplate: false,
          missingRequirements: evidenceRequirements,
          matchedRequirements: [],
          validationErrors: [docxResult.error],
          validationWarnings: [],
          score: 0,
        };
      }
      extractedText = docxResult.text;
    } else if (isPdf) {
      const pdfResult = extractTextFromPdf(fileBuffer);
      extractedText = pdfResult.text;
    } else if (isTextFile) {
      extractedText = fileBuffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
    } else {
      // Try docx parsing first, then fallback to string
      const docxResult = extractTextFromDocx(fileBuffer);
      if (docxResult.text && docxResult.text.length > 10) {
        extractedText = docxResult.text;
      } else {
        extractedText = fileBuffer.toString("utf-8").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, " ");
      }
    }
  }

  const cleanText = extractedText.trim();
  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  // Check 1: Minimum content length
  if (cleanText.length < 20) {
    return {
      success: false,
      extractedTextLength: cleanText.length,
      extractedSnippet: cleanText.slice(0, 150),
      unfilledPlaceholders: [],
      isValidTemplate: false,
      missingRequirements: evidenceRequirements,
      matchedRequirements: [],
      validationErrors: ["Evidence document content is too short or empty (minimum 20 characters required)."],
      validationWarnings: [],
      score: 0,
    };
  }

  // Check 2: Unfilled Template Placeholders
  const placeholderRegexes = [
    /\[Company Name\]/gi,
    /\[Insert Date\]/gi,
    /\[Date\]/gi,
    /\[Author\/Owner\]/gi,
    /\[System Name\]/gi,
    /\[Version\]/gi,
    /\[Your Name\]/gi,
    /\[Organization\]/gi,
    /\[Specify [^\]]+\]/gi,
    /\[Fill in [^\]]+\]/gi,
  ];

  const unfilledPlaceholders: string[] = [];
  for (const regex of placeholderRegexes) {
    const matches = cleanText.match(regex);
    if (matches) {
      for (const m of matches) {
        if (!unfilledPlaceholders.includes(m)) {
          unfilledPlaceholders.push(m);
        }
      }
    }
  }

  if (unfilledPlaceholders.length > 0) {
    validationWarnings.push(
      `Found ${unfilledPlaceholders.length} unfilled template placeholder(s): ${unfilledPlaceholders.slice(0, 5).join(", ")}${unfilledPlaceholders.length > 5 ? "..." : ""}`
    );
  }

  // Check 3: Evidence Requirements Keyword & Semantic Matching
  const matchedRequirements: string[] = [];
  const missingRequirements: string[] = [];
  const lowerText = cleanText.toLowerCase();

  for (const req of evidenceRequirements) {
    if (!req || req.trim().length === 0) continue;
    const cleanReq = req.trim();
    const cleanReqLower = cleanReq.toLowerCase();
    const reqKeywords = extractMeaningfulKeywords(cleanReq);

    if (reqKeywords.length === 0) {
      if (lowerText.includes(cleanReqLower)) {
        matchedRequirements.push(cleanReq);
      } else {
        missingRequirements.push(cleanReq);
      }
      continue;
    }

    let matchCount = 0;
    for (const kw of reqKeywords) {
      if (lowerText.includes(kw)) {
        matchCount++;
      }
    }

    const isDirectMatch = lowerText.includes(cleanReqLower);
    const matchRatio = matchCount / reqKeywords.length;
    const isKeywordMatch = matchRatio >= 0.5 && matchCount >= Math.min(2, reqKeywords.length);

    if (isDirectMatch || isKeywordMatch) {
      matchedRequirements.push(cleanReq);
    } else {
      missingRequirements.push(cleanReq);
    }
  }

  // Check 4: Control Topic Context Relevance Check
  const controlContextText = [
    controlContext?.title || "",
    controlContext?.statement || "",
    controlContext?.category || ""
  ].filter(Boolean).join(" ");

  const controlTopicKeywords = Array.from(new Set([
    ...extractMeaningfulKeywords(controlContextText),
    ...evidenceRequirements.flatMap(req => extractMeaningfulKeywords(req))
  ]));

  let controlRelevanceMatched = 0;
  if (controlTopicKeywords.length > 0) {
    for (const kw of controlTopicKeywords) {
      if (lowerText.includes(kw)) {
        controlRelevanceMatched++;
      }
    }
  }

  const topicRelevanceRatio = controlTopicKeywords.length > 0
    ? controlRelevanceMatched / controlTopicKeywords.length
    : 1;
  const isTopicRelevant = controlTopicKeywords.length === 0 || controlRelevanceMatched >= 3 || topicRelevanceRatio >= 0.3;

  if (!isTopicRelevant) {
    validationErrors.push(
      "Document content has low relevance to this control topic or compliance requirements."
    );
  }

  // Score calculation
  let score = 100;
  if (unfilledPlaceholders.length > 0) {
    score -= Math.min(30, unfilledPlaceholders.length * 10);
  }

  if (evidenceRequirements.length > 0) {
    const reqCoverage = matchedRequirements.length / evidenceRequirements.length;
    score = Math.round(score * reqCoverage);
  }

  if (!isTopicRelevant) {
    score = Math.min(score, Math.round(20 * topicRelevanceRatio));
  }

  const isValidTemplate = isTopicRelevant && unfilledPlaceholders.length === 0 && (evidenceRequirements.length === 0 || matchedRequirements.length > 0);

  if (!isValidTemplate && missingRequirements.length > 0) {
    validationWarnings.push(
      `Missing ${missingRequirements.length} required evidence topic(s): ${missingRequirements.slice(0, 3).join("; ")}`
    );
  }

  const snippet = cleanText.slice(0, 300) + (cleanText.length > 300 ? "..." : "");

  return {
    success: true,
    extractedTextLength: cleanText.length,
    extractedSnippet: snippet,
    unfilledPlaceholders,
    isValidTemplate,
    missingRequirements,
    matchedRequirements,
    validationErrors,
    validationWarnings,
    score,
  };
}

const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB limit

/**
 * Fetches content from an Evidence URL (e.g. UploadThing URL, Google Docs link, PDF, DOCX, or web link)
 * and evaluates its content against evidence requirements.
 */
export async function fetchAndParseEvidenceFromUrl(
  url: string,
  evidenceRequirements: string[] = [],
  controlContext?: ControlContext
): Promise<EvidenceParsingResult> {
  if (!url || typeof url !== "string" || !/^https:\/\//i.test(url.trim())) {
    return {
      success: false,
      extractedTextLength: 0,
      extractedSnippet: "",
      unfilledPlaceholders: [],
      isValidTemplate: false,
      missingRequirements: evidenceRequirements,
      matchedRequirements: [],
      validationErrors: ["Invalid HTTPS Evidence URL format."],
      validationWarnings: [],
      score: 0,
    };
  }

  let currentUrl = url.trim();
  let response: Response | null = null;
  let redirectsRemaining = 3;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    while (true) {
      const ssrfCheck = await validateUrlForSsrf(currentUrl);
      if (!ssrfCheck.safe) {
        return {
          success: false,
          extractedTextLength: 0,
          extractedSnippet: "",
          unfilledPlaceholders: [],
          isValidTemplate: false,
          missingRequirements: evidenceRequirements,
          matchedRequirements: [],
          validationErrors: [ssrfCheck.error || "Forbidden Evidence URL host."],
          validationWarnings: [],
          score: 0,
        };
      }

      response = await fetch(currentUrl, {
        signal: controller.signal,
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 MATUR.ai EvidenceValidator/1.0",
          "Accept": "text/html,application/xhtml+xml,application/xml,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,*/*",
        },
      });

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        if (!location || redirectsRemaining <= 0) {
          return {
            success: false,
            extractedTextLength: 0,
            extractedSnippet: "",
            unfilledPlaceholders: [],
            isValidTemplate: false,
            missingRequirements: evidenceRequirements,
            matchedRequirements: [],
            validationErrors: ["Too many redirects or invalid redirect target."],
            validationWarnings: [],
            score: 0,
          };
        }
        redirectsRemaining--;
        currentUrl = new URL(location, currentUrl).toString();
        continue;
      }

      break;
    }

    if (!response.ok) {
      return {
        success: false,
        extractedTextLength: 0,
        extractedSnippet: "",
        unfilledPlaceholders: [],
        isValidTemplate: false,
        missingRequirements: evidenceRequirements,
        matchedRequirements: [],
        validationErrors: [`Unable to access Evidence URL (HTTP ${response.status}). Please verify link access permissions.`],
        validationWarnings: [],
        score: 0,
      };
    }

    const contentLengthHeader = response.headers.get("content-length");
    if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_RESPONSE_SIZE) {
      return {
        success: false,
        extractedTextLength: 0,
        extractedSnippet: "",
        unfilledPlaceholders: [],
        isValidTemplate: false,
        missingRequirements: evidenceRequirements,
        matchedRequirements: [],
        validationErrors: ["Evidence document exceeds maximum permitted size (10MB)."],
        validationWarnings: [],
        score: 0,
      };
    }

    const contentType = response.headers.get("content-type") || "";
    let isDocx = /\.docx/i.test(currentUrl) || /officedocument\.wordprocessingml/i.test(contentType);
    let isPdf = /\.pdf/i.test(currentUrl) || /application\/pdf/i.test(contentType);

    // For ambiguous content types (e.g. octet-stream from UploadThing), detect via magic bytes
    const isAmbiguousType = !isDocx && !isPdf && (/octet-stream/i.test(contentType) || !contentType || contentType === "application/octet-stream");

    if (isDocx || isPdf || isAmbiguousType) {
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_RESPONSE_SIZE) {
        return {
          success: false,
          extractedTextLength: 0,
          extractedSnippet: "",
          unfilledPlaceholders: [],
          isValidTemplate: false,
          missingRequirements: evidenceRequirements,
          matchedRequirements: [],
          validationErrors: ["Evidence document exceeds maximum permitted size (10MB)."],
          validationWarnings: [],
          score: 0,
        };
      }
      const buffer = Buffer.from(arrayBuffer);

      // Magic bytes detection for ambiguous content types
      if (isAmbiguousType && !isDocx && !isPdf) {
        // ZIP/DOCX magic bytes: PK\x03\x04
        if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
          isDocx = true;
        }
        // PDF magic bytes: %PDF
        else if (buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
          isPdf = true;
        }
      }

      if (isDocx || isPdf) {
        const filename = isDocx ? "evidence.docx" : "evidence.pdf";
        return parseAndValidateEvidence(buffer, null, filename, evidenceRequirements, controlContext);
      }

      // If magic bytes didn't match docx/pdf, try as text
      const textContent = buffer.toString("utf-8");
      const isHtml = /<html|<body|<div|<p/i.test(textContent);
      const parsedText = isHtml ? extractTextFromHtml(textContent) : textContent;
      return parseAndValidateEvidence(null, parsedText, "evidence.txt", evidenceRequirements, controlContext);
    } else {
      const textContent = await response.text();
      if (textContent.length > MAX_RESPONSE_SIZE) {
        return {
          success: false,
          extractedTextLength: 0,
          extractedSnippet: "",
          unfilledPlaceholders: [],
          isValidTemplate: false,
          missingRequirements: evidenceRequirements,
          matchedRequirements: [],
          validationErrors: ["Evidence content exceeds maximum permitted size (10MB)."],
          validationWarnings: [],
          score: 0,
        };
      }
      const isHtml = /<html|<body|<div|<p/i.test(textContent);
      const parsedText = isHtml ? extractTextFromHtml(textContent) : textContent;
      return parseAndValidateEvidence(null, parsedText, "evidence.txt", evidenceRequirements, controlContext);
    }
  } catch (err: any) {
    console.error("[evidenceParser] Failed to fetch and parse URL:", err);
    return {
      success: false,
      extractedTextLength: 0,
      extractedSnippet: "",
      unfilledPlaceholders: [],
      isValidTemplate: false,
      missingRequirements: evidenceRequirements,
      matchedRequirements: [],
      validationErrors: ["Failed to load or parse URL content. Please verify link access permissions."],
      validationWarnings: [],
      score: 0,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
