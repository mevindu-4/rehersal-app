import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { embedDocument } from "@/lib/embeddings";
import { parseFile } from "@/lib/fileParser";
import { CreateDocumentSchema } from "@/lib/schemas";
import type { DocType, EmbeddingStatus, FileType } from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const doc_type = searchParams.get("doc_type") as DocType | null;
  const embedding_status = searchParams.get(
    "embedding_status"
  ) as EmbeddingStatus | null;

  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("user_documents")
    .select("*")
    .eq("org_id", auth.session.organization.id)
    .eq("user_id", auth.session.user.id)
    .eq("is_company_shared", false)
    .order("created_at", { ascending: false });

  if (doc_type) query = query.eq("doc_type", doc_type);
  if (embedding_status) query = query.eq("embedding_status", embedding_status);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const parsed = await parseJsonBody(request, CreateDocumentSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();

  let extracted_text: string | null = null;
  try {
    const res = await fetch(parsed.data.file_url);
    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      extracted_text = await parseFile(buffer, parsed.data.file_type as FileType);
    }
  } catch {
    extracted_text = null;
  }

  const { data, error } = await supabase
    .from("user_documents")
    .insert({
      org_id: auth.session.organization.id,
      user_id: auth.session.user.id,
      filename: parsed.data.filename,
      file_url: parsed.data.file_url,
      file_size_bytes: parsed.data.file_size_bytes,
      file_type: parsed.data.file_type,
      doc_type: parsed.data.doc_type,
      is_company_shared: parsed.data.is_company_shared ?? false,
      extracted_text,
      embedding_status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to create document", 500);
  }

  void embedDocument(data.id).catch(() => {
    /* status updated to failed inside embedDocument */
  });

  return jsonOk({ document: data }, 201);
}
