import { createServiceSupabaseClient } from "@/lib/db";
import { embedBatch, isOpenAIConfigured } from "@/lib/openai";
import { parseFile } from "@/lib/fileParser";
import type { FileType } from "@/types";

const CHUNK_CHARS = 512 * 4;
const OVERLAP_CHARS = 50 * 4;

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < normalized.length) {
    let end = Math.min(start + CHUNK_CHARS, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const lastBreak = Math.max(
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("? "),
        slice.lastIndexOf("! ")
      );
      if (lastBreak > CHUNK_CHARS * 0.5) {
        end = start + lastBreak + 1;
      }
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk) chunks.push(chunk);

    if (end >= normalized.length) break;
    start = Math.max(end - OVERLAP_CHARS, start + 1);
  }

  return chunks;
}

export async function embedDocument(documentId: string): Promise<void> {
  const supabase = createServiceSupabaseClient();

  const { data: doc, error } = await supabase
    .from("user_documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error || !doc) throw new Error("Document not found");

  if (!isOpenAIConfigured()) {
    await supabase
      .from("user_documents")
      .update({ embedding_status: "failed" })
      .eq("id", documentId);
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  await supabase
    .from("user_documents")
    .update({ embedding_status: "processing" })
    .eq("id", documentId);

  try {
    let text = doc.extracted_text;
    if (!text?.trim()) {
      const res = await fetch(doc.file_url);
      if (!res.ok) throw new Error("Failed to fetch document file");
      const buffer = Buffer.from(await res.arrayBuffer());
      text = await parseFile(buffer, doc.file_type as FileType);
      await supabase
        .from("user_documents")
        .update({ extracted_text: text })
        .eq("id", documentId);
    }

    const chunks = chunkText(text ?? "");
    if (chunks.length === 0) {
      throw new Error("No extractable text in document");
    }

    await supabase
      .from("document_chunks")
      .delete()
      .eq("user_document_id", documentId);

    const vectors = await embedBatch(chunks);

    const rows = chunks.map((chunk_text, index) => ({
      user_document_id: documentId,
      chunk_text,
      chunk_index: index,
      embedding: vectors[index],
    }));

    const { error: insertError } = await supabase
      .from("document_chunks")
      .insert(rows);

    if (insertError) throw insertError;

    await supabase
      .from("user_documents")
      .update({ embedding_status: "complete" })
      .eq("id", documentId);
  } catch (e) {
    await supabase
      .from("user_documents")
      .update({ embedding_status: "failed" })
      .eq("id", documentId);
    throw e;
  }
}

export async function embedPendingDocuments(orgId?: string): Promise<number> {
  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("user_documents")
    .select("id")
    .in("embedding_status", ["pending", "failed"]);

  if (orgId) query = query.eq("org_id", orgId);

  const { data: docs } = await query;
  let count = 0;

  for (const doc of docs ?? []) {
    await embedDocument(doc.id);
    count += 1;
  }

  return count;
}
