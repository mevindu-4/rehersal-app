import { requireAuth, requireOwner } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { embedDocument } from "@/lib/embeddings";
import { parseFile } from "@/lib/fileParser";
import { CreateDocumentSchema } from "@/lib/schemas";
import type { FileType } from "@/types";

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("user_documents")
    .select("*")
    .eq("org_id", auth.session.organization.id)
    .eq("is_company_shared", true)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  return jsonOk({ documents: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

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
      is_company_shared: true,
      extracted_text,
      embedding_status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to create document", 500);
  }

  void embedDocument(data.id).catch(() => undefined);

  return jsonOk({ document: data }, 201);
}
