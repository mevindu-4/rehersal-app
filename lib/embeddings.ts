const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
/** Matches Supabase `document_chunks.embedding vector(1536)` (OpenAI small). */
export const EMBEDDING_DIMENSIONS = 1536;

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  const cleaned = text.replace(/\s+/g, " ").trim();
  while (start < cleaned.length) {
    const end = Math.min(start + CHUNK_SIZE, cleaned.length);
    chunks.push(cleaned.slice(start, end));
    start += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks.filter((c) => c.length > 50);
}

function padToDimensions(vector: number[], dimensions: number): number[] {
  if (vector.length === dimensions) return vector;
  if (vector.length > dimensions) return vector.slice(0, dimensions);
  return [...vector, ...new Array(dimensions - vector.length).fill(0)];
}

async function embedWithJina(
  text: string,
  task: "retrieval.query" | "retrieval.passage"
): Promise<number[] | null> {
  const apiKey = process.env.JINA_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "jina-embeddings-v3",
      task,
      dimensions: 1024,
      input: [text.slice(0, 8000)],
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const vec = json.data?.[0]?.embedding as number[] | undefined;
  if (!vec?.length) return null;
  return padToDimensions(vec, EMBEDDING_DIMENSIONS);
}

async function embedWithOpenAI(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const vec = json.data?.[0]?.embedding as number[] | undefined;
  if (!vec?.length) return null;
  return padToDimensions(vec, EMBEDDING_DIMENSIONS);
}

/** Prefer Jina when configured, otherwise OpenAI. */
export async function embedText(
  text: string,
  options?: { task?: "retrieval.query" | "retrieval.passage" }
): Promise<number[] | null> {
  const task = options?.task ?? "retrieval.passage";
  if (process.env.JINA_API_KEY?.trim()) {
    const jina = await embedWithJina(text, task);
    if (jina) return jina;
  }
  return embedWithOpenAI(text);
}

export function hasEmbeddingProvider(): boolean {
  return Boolean(
    process.env.JINA_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim()
  );
}

export async function embedDocument(
  userDocumentId: string,
  text: string
): Promise<void> {
  const { createServiceClient } = await import("@/lib/supabase/server");
  const supabase = createServiceClient();
  const chunks = chunkText(text);

  await supabase
    .from("document_chunks")
    .delete()
    .eq("user_document_id", userDocumentId);

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(chunks[i], {
      task: "retrieval.passage",
    });
    await supabase.from("document_chunks").insert({
      user_document_id: userDocumentId,
      chunk_text: chunks[i],
      chunk_index: i,
      embedding: embedding ?? null,
    });
  }
}
