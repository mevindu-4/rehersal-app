import { createServiceSupabaseClient } from "@/lib/db";
import { embed, isOpenAIConfigured } from "@/lib/openai";

export interface RetrievedChunk {
  chunk_text: string;
  similarity: number;
}

export async function retrieveContext(params: {
  orgId: string;
  userId: string;
  goal: string;
  includeCompany: boolean;
  limit?: number;
}): Promise<string> {
  if (!isOpenAIConfigured()) {
    return "No uploaded context documents matched this scenario. (Embeddings require OPENAI_API_KEY.)";
  }

  const supabase = createServiceSupabaseClient();
  const queryEmbedding = await embed(params.goal);

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_count: params.limit ?? 5,
    filter_org_id: params.orgId,
    filter_user_id: params.userId,
    include_company: params.includeCompany,
  });

  if (error) {
    throw new Error(error.message);
  }

  const chunks = (data ?? []) as RetrievedChunk[];
  if (chunks.length === 0) {
    return "No uploaded context documents matched this scenario.";
  }

  return chunks
    .map((c, i) => `[Context ${i + 1}]\n${c.chunk_text}`)
    .join("\n\n");
}
