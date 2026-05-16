import { createServiceClient } from "@/lib/supabase/server";
import { embedText } from "@/lib/embeddings";

const DOC_TYPE_PRIORITY = [
  "company",
  "opportunity",
  "my_background",
  "product",
  "prior_interactions",
  "other",
] as const;

type UserDocRow = {
  id: string;
  filename: string;
  doc_type: string;
  extracted_text: string | null;
};

export async function getRelevantChunks(
  userId: string,
  orgId: string,
  query: string,
  limit = 5
): Promise<string[]> {
  const supabase = createServiceClient();

  const { data: docs } = await supabase
    .from("user_documents")
    .select("id")
    .eq("user_id", userId)
    .eq("org_id", orgId);

  if (!docs?.length) return [];

  const docIds = docs.map((d) => d.id);
  const { data: chunks } = await supabase
    .from("document_chunks")
    .select("chunk_text, embedding")
    .in("user_document_id", docIds);

  if (!chunks?.length) return [];

  const queryEmbedding = await embedText(query, { task: "retrieval.query" });

  if (queryEmbedding) {
    const scored = chunks
      .filter((c) => c.embedding)
      .map((c) => ({
        text: c.chunk_text as string,
        score: cosineSimilarity(queryEmbedding, c.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    if (scored.length) return scored.map((s) => s.text);
  }

  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  const scored = chunks.map((c) => {
    const text = (c.chunk_text as string).toLowerCase();
    const score = terms.reduce((n, t) => n + (text.includes(t) ? 1 : 0), 0);
    return { text: c.chunk_text as string, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.text);
}

function excerpt(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

function dedupeParts(parts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const key = p.slice(0, 120).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/** Full document context for avatar briefs — not only vector search. */
export async function getUserDocumentContext(
  userId: string,
  orgId: string,
  query: string,
  options?: { maxParts?: number; excerptChars?: number }
): Promise<string[]> {
  const maxParts = options?.maxParts ?? 12;
  const excerptChars = options?.excerptChars ?? 2800;

  const supabase = createServiceClient();
  const { data: docs } = await supabase
    .from("user_documents")
    .select("id, filename, doc_type, extracted_text")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (!docs?.length) return [];

  const searchQuery = `${query} company linkedin background opportunity role interview`;
  const semantic = await getRelevantChunks(userId, orgId, searchQuery, 6);
  const parts = dedupeParts([...semantic]);

  const byType = new Map<string, UserDocRow[]>();
  for (const doc of docs as UserDocRow[]) {
    const list = byType.get(doc.doc_type) ?? [];
    list.push(doc);
    byType.set(doc.doc_type, list);
  }

  for (const docType of DOC_TYPE_PRIORITY) {
    for (const doc of byType.get(docType) ?? []) {
      const text = doc.extracted_text?.trim();
      if (!text) continue;
      const label = docType.replace(/_/g, " ");
      parts.push(
        `[${label}: ${doc.filename}]\n${excerpt(text, excerptChars)}`
      );
    }
  }

  return dedupeParts(parts).slice(0, maxParts);
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}
