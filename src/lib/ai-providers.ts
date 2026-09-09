"use client";

export type ProviderId =
  | "openai"
  | "gemini"
  | "anthropic"
  | "grok"
  | "mistral"
  | "openrouter";

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  color: string;
  keyUrl: string;
  models: { id: string; name: string }[];
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    color: "#10a37f",
    keyUrl: "https://platform.openai.com/api-keys",
    models: [
      { id: "gpt-5", name: "GPT-5" },
      { id: "gpt-5-mini", name: "GPT-5 Mini" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
      { id: "o4-mini", name: "o4-mini" },
    ],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    color: "#4285f4",
    keyUrl: "https://aistudio.google.com/apikey",
    models: [
      { id: "gemini-flash-latest", name: "gemini-flash-latest" },
      { id: "gemini-2.5-flash", name: "gemini-2.5-flash" },
      { id: "gemini-2.5-flash-lite", name: "gemini-2.5-flash-lite" },
      { id: "gemini-2.0-flash", name: "gemini-2.0-flash" },
      { id: "gemini-1.5-flash", name: "gemini-1.5-flash" },
      { id: "gemini-3-flash", name: "gemini-3-flash" },
      { id: "gemini-3.1-flash-lite", name: "gemini-3.1-flash-lite" },
      { id: "gemini-3.5-flash", name: "gemini-3.5-flash" },
      { id: "gemini-3.5-flash-lite", name: "gemini-3.5-flash-lite" },
      { id: "gemini-3.6-flash", name: "gemini-3.6-flash" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    color: "#d4a574",
    keyUrl: "https://console.anthropic.com/settings/keys",
    models: [
      { id: "claude-sonnet-5", name: "Claude Sonnet 5" },
      { id: "claude-opus-4-8", name: "Claude Opus 4" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
      { id: "claude-fable-5", name: "Claude Fable 5" },
    ],
  },
  {
    id: "grok",
    name: "Grok (xAI)",
    color: "#1d9bf0",
    keyUrl: "https://console.x.ai/",
    models: [
      { id: "grok-3", name: "Grok-3" },
      { id: "grok-3-mini", name: "Grok-3 Mini" },
      { id: "grok-2", name: "Grok-2" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    color: "#ff7000",
    keyUrl: "https://console.mistral.ai/api-keys",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large" },
      { id: "mistral-medium-latest", name: "Mistral Medium" },
      { id: "mistral-small-latest", name: "Mistral Small" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    color: "#6366f1",
    keyUrl: "https://openrouter.ai/keys",
    models: [
      { id: "openai/gpt-4o", name: "GPT-4o (via OR)" },
      { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4 (via OR)" },
      { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash (via OR)" },
    ],
  },
];

export interface ApiKeyEntry {
  id: string;
  key: string;
  model: string;
  isActive: boolean;
  isValid: boolean | null; // null = not validated, true = valid, false = invalid
}

export interface GeneratedMetadata {
  title: string;
  description: string;
  keywords: string[];
  prompt?: string;
  category?: string;
  category1?: string;
  category2?: string;
  releases?: string;
}

export const STORAGE_KEYS_KEY = "metagen_api_keys_v2";
export const STORAGE_PROVIDER_KEY = "metagen_active_provider";
export const PROFILE_KEY = "metagen_profiles";

// ─── Storage Functions ───

export function getStoredKeysAll(): Record<ProviderId, ApiKeyEntry[]> {
  if (typeof window === "undefined") return { openai: [], gemini: [], anthropic: [], grok: [], mistral: [], openrouter: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { openai: [], gemini: [], anthropic: [], grok: [], mistral: [], openrouter: [] };
}

export function saveStoredKeysAll(keys: Record<ProviderId, ApiKeyEntry[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(keys));
}

export function getStoredProvider(): { provider: ProviderId; model: string } {
  if (typeof window === "undefined") return { provider: "openai", model: "gpt-4o" };
  try {
    const raw = localStorage.getItem(STORAGE_PROVIDER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { provider: "openai", model: "gpt-4o" };
}

export function saveStoredProvider(provider: ProviderId, model: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_PROVIDER_KEY, JSON.stringify({ provider, model }));
}

// ─── API Endpoints ───

export function getProviderEndpoint(provider: ProviderId): string {
  switch (provider) {
    case "openai":
      return "https://api.openai.com/v1/chat/completions";
    case "gemini":
      return "https://generativelanguage.googleapis.com/v1beta/models";
    case "anthropic":
      return "https://api.anthropic.com/v1/messages";
    case "grok":
      return "https://api.x.ai/v1/chat/completions";
    case "mistral":
      return "https://api.mistral.ai/v1/chat/completions";
    case "openrouter":
      return "https://openrouter.ai/api/v1/chat/completions";
  }
}

// ─── Validate API Key ───

export async function validateApiKey(
  provider: ProviderId,
  apiKey: string,
  model: string
): Promise<boolean> {
  try {
    // Server-side validation to avoid CORS on live (abanti.in)
    const resp = await fetch("/api/validate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey, model }),
    });
    const data = await resp.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

// ─── Generate Metadata ───

export async function generateMetadataWithKey(
  apiKey: string,
  provider: ProviderId,
  model: string,
  mediaKind: "image" | "video" | "text",
  base64Data: string | null,
  mimeType: string,
  prompt: string,
  signal?: AbortSignal,
): Promise<string> {
  const systemMessage = prompt;

  if (provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const parts: { text?: string; inlineData?: { mimeType: string; data: string } }[] = [];

    if (mediaKind === "text" || !base64Data) {
      parts.push({ text: "Generate metadata. Follow the system instructions exactly." });
    } else {
      parts.push({ text: `Generate metadata for this ${mediaKind}. Follow the system instructions exactly.` });
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: systemMessage }] },
        generationConfig: { maxOutputTokens: 4096 },
      }),
      signal,
    });

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error?.message || "Gemini API error");
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (provider === "openai" || provider === "grok" || provider === "mistral" || provider === "openrouter") {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }
  if (provider === "anthropic") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  }
  if (provider === "openrouter") {
    headers["HTTP-Referer"] = typeof window !== "undefined" ? window.location.origin : "";
  }

  const endpoint = getProviderEndpoint(provider);

  let userContent: any;
  if (mediaKind === "text" || !base64Data) {
    userContent = "Generate metadata. Follow the system instructions exactly.";
  } else if (provider === "anthropic") {
    userContent = [
      { type: "image", source: { type: "base64", media_type: mimeType, data: base64Data } },
      { type: "text", text: `Generate metadata for this ${mediaKind}. Follow the system instructions exactly.` },
    ];
  } else {
    userContent = [
      { type: "text", text: `Generate metadata for this ${mediaKind}. Follow the system instructions exactly.` },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
    ];
  }

  const body =
    provider === "anthropic"
      ? {
          model,
          max_tokens: 4096,
          messages: [{ role: "user", content: userContent }],
          system: systemMessage,
        }
      : {
          model,
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userContent },
          ],
          max_tokens: 4096,
        };

  const resp = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || "API error");

  if (provider === "anthropic") {
    return data.content?.[0]?.text || "";
  }
  return data.choices?.[0]?.message?.content || "";
}

// ─── Platform Prompts ───

export function getPlatformPrompt(
  platform: string,
  mediaKind: "image" | "video" | "text",
  settings: any,
): string {
  const titleLength = settings.titleLength || [30, 80];
  const keywordCount = settings.keywordCount || [20, 40];
  const descLength = settings.descLength || [50, 150];
  const language = settings.language || "English";

  const commonRules = `
- Generate ALL metadata in ${language} language ONLY
- Keywords must be highly relevant to the actual content shown
- Never include generic filler keywords
- Never include the word "editorial" in keywords
${settings.transparentBg ? "- Image likely has transparent background - mention this in keywords" : ""}
${settings.whiteBg ? "- Image likely has white background - mention this in keywords" : ""}
${settings.filterIp ? "- Filter out any intellectual property references (brand names, logos, trademarks)" : ""}
${settings.customKeywords ? `- Always include these keywords: ${settings.customKeywords}` : ""}
${settings.bannedWords ? `- Never include these words: ${settings.bannedWords}` : ""}
  `.trim();

  const platformConfig: Record<string, string> = {
    adobestock: `You are an expert Adobe Stock metadata generator.
Adobe Stock prioritizes TITLE for search ranking. Generate a highly SEO-optimized, keyword-rich title.
Do NOT generate a description (Adobe Stock doesn't use descriptions).
Generate precise, searchable categories.

${commonRules}

OUTPUT FORMAT (JSON only):
{
  "title": "concise subject with descriptive keywords, comma-separated phrase style",
  "keywords": ["word1", "word2", ...],
  "category": "Best matching Adobe Stock category"
}

TITLE RULES (MOST IMPORTANT):
- Title length: ${titleLength[0]}-${titleLength[1]} characters
- Format: "subject, descriptive keywords, style, mood"
- Front-load the most important search terms
- Use comma-separated phrases, not sentences

KEYWORD RULES:
- Total keywords: ${keywordCount[0]}-${keywordCount[1]}
- Mix broad and specific terms`,

    shutterstock: `You are an expert Shutterstock metadata generator.
Shutterstock prioritizes DESCRIPTION for SEO and search ranking.
Generate a detailed, keyword-rich description that reads naturally.

${commonRules}

OUTPUT FORMAT (JSON only):
{
  "title": "Simple descriptive title",
  "description": "Detailed multi-sentence description rich with keywords and context...",
  "keywords": ["word1", "word2", ...],
  "category1": "Primary Shutterstock category",
  "category2": "Secondary Shutterstock category"
}

DESCRIPTION RULES (MOST IMPORTANT):
- Description length: ${descLength[0]}-${descLength[1]} characters minimum
- Write 2-4 natural sentences
- Include keywords naturally within the description`,

    freepik: `You are an expert Freepik metadata generator.
${commonRules}
OUTPUT FORMAT (JSON only): { "title": "Descriptive title", "keywords": ["word1", ...] }
KEYWORD RULES: Total keywords: ${keywordCount[0]}-${keywordCount[1]}`,

    vecteezy: `You are an expert Vecteezy metadata generator.
${commonRules}
OUTPUT FORMAT (JSON only): { "title": "Descriptive title", "keywords": ["word1", ...] }
KEYWORD RULES: Total keywords: ${keywordCount[0]}-${keywordCount[1]}`,

    istock: `You are an expert iStock metadata generator.
${commonRules}
OUTPUT FORMAT (JSON only): { "title": "Title", "description": "Detailed description...", "keywords": ["word1", ...] }
DESCRIPTION length: ${descLength[0]}-${descLength[1]}. Keywords: ${keywordCount[0]}-${keywordCount[1]}`,

    pond5: `You are an expert Pond5 metadata generator.
${commonRules}
OUTPUT FORMAT (JSON only): { "title": "Title", "description": "Description...", "keywords": ["word1", ...] }
Keywords: ${keywordCount[0]}-${keywordCount[1]}`,
  };

  return platformConfig[platform] || platformConfig.adobestock;
}

// ─── CSV Export ───

export function generateCSV(results: { fileName: string; metadata: GeneratedMetadata; platform: string }[]): string {
  if (results.length === 0) return "";
  const columns = [
    { key: "filename", label: "Filename" },
    { key: "title", label: "Title" },
    { key: "description", label: "Description" },
    { key: "keywords", label: "Keywords" },
    { key: "category", label: "Category" },
  ];
  const rows = [columns.map(c => c.label).join(",")];
  for (const r of results) {
    const m = r.metadata;
    const row = columns.map(c => {
      let val = "";
      switch (c.key) {
        case "filename": val = r.fileName; break;
        case "title": val = m.title || ""; break;
        case "description": val = m.description || ""; break;
        case "keywords": val = Array.isArray(m.keywords) ? m.keywords.join(", ") : ""; break;
        case "category": val = m.category || m.category1 || ""; break;
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    rows.push(row.join(","));
  }
  return rows.join("\n");
}

export function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Key Helpers ───

export function maskKey(key: string): string {
  if (key.length <= 16) return "•".repeat(key.length);
  return key.substring(0, 4) + "•".repeat(key.length - 8) + key.substring(key.length - 4);
}

export function getModelDisplayName(provider: ProviderId, modelId: string): string {
  const providerConfig = PROVIDERS.find(p => p.id === provider);
  if (!providerConfig) return modelId;
  const model = providerConfig.models.find(m => m.id === modelId);
  return model?.name || modelId;
}

// ─── Concurrency Limiter ───

/**
 * Run an array of async tasks with a concurrency limit.
 * Returns results in the same order as the input tasks.
 */
export async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function runNext(): Promise<void> {
    while (nextIndex < tasks.length) {
      const i = nextIndex++;
      results[i] = await tasks[i]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => runNext());
  await Promise.all(workers);
  return results;
}
