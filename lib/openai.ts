import OpenAI from "openai";
import type { ZodSchema } from "zod";
import { validateAISafety } from "./schemas";

const MODEL = "gpt-4o";
const EMBEDDING_MODEL = "text-embedding-3-small";

/** True when OPENAI_API_KEY is set — use before AI routes/pipelines. */
export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }
  return new OpenAI({ apiKey });
}

export async function completion(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4096,
  });

  const text = response.choices[0]?.message?.content ?? "";
  const safety = validateAISafety(text);
  if (!safety.safe) {
    throw new Error(`AI output blocked: forbidden language detected`);
  }
  return text;
}

export async function completionJSON<T>(
  prompt: string,
  schema: ZodSchema<T>,
  options?: { temperature?: number }
): Promise<T> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a structured data extractor. Respond with valid JSON only. No markdown, no preamble.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: options?.temperature ?? 0.2,
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  const safety = validateAISafety(raw);
  if (!safety.safe) {
    throw new Error(`AI output blocked: forbidden language detected`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Failed to parse AI JSON response");
  }

  return schema.parse(parsed);
}

export async function embed(text: string): Promise<number[]> {
  const client = getClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const client = getClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts,
  });
  return response.data.map((d) => d.embedding);
}
