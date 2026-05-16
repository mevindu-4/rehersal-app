import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { embedDocument, hasEmbeddingProvider } from "@/lib/embeddings";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Re-chunk and embed all documents for the current user (run after adding JINA_API_KEY). */
export async function POST() {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  if (!hasEmbeddingProvider()) {
    return jsonError(
      "Set JINA_API_KEY or OPENAI_API_KEY in .env.local to enable embeddings.",
      400
    );
  }

  const supabase = createServiceClient();
  const { data: docs, error } = await supabase
    .from("user_documents")
    .select("id, extracted_text, filename")
    .eq("user_id", ctx.userId)
    .eq("org_id", ctx.orgId);

  if (error) return jsonError(error.message, 500);

  let indexed = 0;
  const failures: string[] = [];

  for (const doc of docs ?? []) {
    const text = (doc.extracted_text as string | null)?.trim();
    if (!text) {
      failures.push(`${doc.filename}: no extracted text`);
      continue;
    }
    try {
      await embedDocument(doc.id as string, text);
      indexed += 1;
    } catch (e) {
      failures.push(
        `${doc.filename}: ${e instanceof Error ? e.message : "embed failed"}`
      );
    }
  }

  return jsonOk({
    indexed,
    total: docs?.length ?? 0,
    failures,
  });
}
