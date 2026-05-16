import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";

export type LlmProvider = "anthropic" | "gemini";

export function getLlmProvider(): LlmProvider | null {
  const explicit = process.env.LLM_PROVIDER?.toLowerCase();
  if (explicit === "gemini") return "gemini";
  if (explicit === "anthropic" || explicit === "claude") return "anthropic";

  if (getGeminiApiKey()) return "gemini";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

export function isDemoMode(): boolean {
  return (
    process.env.LLM_DEMO_MODE === "true" ||
    process.env.ANTHROPIC_DEMO_MODE === "true" ||
    getLlmProvider() === null
  );
}

async function callAnthropic(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: options?.maxTokens ?? 8192,
    temperature: options?.temperature ?? 0.3,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }
  return block.text;
}

async function callGemini(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is not configured");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxTokens ?? 8192,
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(userMessage);
  const text = result.response.text();
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  return text;
}

/** Primary LLM entry — uses Gemini or Claude based on env. */
export async function callLlm(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; temperature?: number }
): Promise<string> {
  const provider = getLlmProvider();
  if (!provider) {
    throw new Error("No LLM configured. Set GEMINI_API_KEY or ANTHROPIC_API_KEY.");
  }
  if (provider === "gemini") {
    return callGemini(systemPrompt, userMessage, options);
  }
  return callAnthropic(systemPrompt, userMessage, options);
}

/** @deprecated Use callLlm */
export const callClaude = callLlm;

export function parseJsonFromLlm<T>(raw: string): T {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const payload = jsonMatch ? jsonMatch[1].trim() : trimmed;
  return JSON.parse(payload) as T;
}
