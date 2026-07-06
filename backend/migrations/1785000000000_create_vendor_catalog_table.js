/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = async (pgm) => {
  await pgm.db.query(`
    CREATE TABLE IF NOT EXISTS vendor_catalog (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_name VARCHAR(255) NOT NULL,
      models JSONB NOT NULL DEFAULT '[]'::jsonb,
      compliance_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_catalog_lower_vendor_name ON vendor_catalog (LOWER(vendor_name));
  `);

  // Seed data
  const catalog = {
    "OpenAI": {
      models: ["GPT-4o", "GPT-4", "GPT-3.5-Turbo", "o1", "o1-mini", "Text-Embedding-3-Small", "Text-Embedding-3-Large"],
      compliance_url: "https://trust.openai.com/"
    },
    "Anthropic": {
      models: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude 3 Haiku", "Claude 2.1"],
      compliance_url: "https://trust.anthropic.com/"
    },
    "Google": {
      models: ["Gemini 1.5 Pro", "Gemini 1.5 Flash", "Gemini 1.0 Pro", "Text-Gecko", "Vertex AI Embeddings"],
      compliance_url: "https://cloud.google.com/security/compliance"
    },
    "Meta": {
      models: ["Llama 3 8B", "Llama 3 70B", "Llama 3 405B", "Llama 2 13B"],
      compliance_url: null
    },
    "Mistral": {
      models: ["Mistral Large", "Mistral 8x22B", "Mixtral 8x7B"],
      compliance_url: null
    },
    "Cohere": {
      models: ["Command R+", "Command R", "Embed English v3", "Embed Multilingual v3"],
      compliance_url: "https://cohere.com/security"
    },
    "AWS Bedrock": {
      models: ["Claude 3.5 Sonnet (Bedrock)", "Llama 3 (Bedrock)", "Titan Embeddings"],
      compliance_url: "https://aws.amazon.com/compliance"
    },
    "Azure OpenAI": {
      models: ["GPT-4 (Azure)", "GPT-3.5 (Azure)", "Ada-002 (Azure)"],
      compliance_url: "https://learn.microsoft.com/en-us/azure/compliance/"
    },
    "Vertex AI": {
      models: ["Gemini 1.5 Pro (Vertex)", "Gemini 1.5 Flash (Vertex)"],
      compliance_url: null
    },
    "HuggingFace": {
      models: ["Various Open Source Models"],
      compliance_url: null
    },
    "Pinecone": {
      models: ["Serverless Index", "Pod Index"],
      compliance_url: "https://www.pinecone.io/security/"
    },
    "Weaviate": {
      models: ["Cloud Service", "Self-Hosted"],
      compliance_url: "https://weaviate.io/security"
    },
    "ChromaDB": {
      models: ["Local SQLite", "Docker"],
      compliance_url: null
    },
    "Qdrant": {
      models: ["Cloud Index", "Self-Hosted"],
      compliance_url: null
    },
    "LangChain": {
      models: ["Agent/Chain Pipeline"],
      compliance_url: null
    },
    "LlamaIndex": {
      models: ["RAG Pipeline"],
      compliance_url: null
    },
    "Other": {
      models: ["Custom Model/Service"],
      compliance_url: null
    }
  };

  for (const [vendor, data] of Object.entries(catalog)) {
    await pgm.db.query(
      `INSERT INTO vendor_catalog (vendor_name, models, compliance_url) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [vendor, JSON.stringify(data.models), data.compliance_url]
    );
  }
};

exports.down = async (pgm) => {
  await pgm.db.query("DROP TABLE IF EXISTS vendor_catalog;");
};
