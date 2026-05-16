import { randomUUID } from "crypto";
import { requireAuth, requireOwner } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { embedDocument } from "@/lib/embeddings";
import { parseFile } from "@/lib/fileParser";
import { DocTypeSchema } from "@/lib/schemas";
import type { DocType, FileType } from "@/types";

export const runtime = "nodejs";

const MAX_BYTES = 50 * 1024 * 1024;

const MIME_TO_TYPE: Record<string, FileType> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
};

function detectFileType(file: File): FileType | null {
  const fromMime = MIME_TO_TYPE[file.type];
  if (fromMime) return fromMime;
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".docx")) return "docx";
  if (lower.endsWith(".txt")) return "txt";
  return null;
}

function safeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

/**
 * POST /api/documents/upload
 * multipart/form-data: file, doc_type, is_company_shared (optional)
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Expected multipart form data", 400);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return jsonError("Missing file field", 400);
  }

  if (file.size > MAX_BYTES) {
    return jsonError("File exceeds 50MB limit", 400);
  }

  const fileType = detectFileType(file);
  if (!fileType) {
    return jsonError("Unsupported file type. Use PDF, DOCX, or TXT.", 400);
  }

  const docTypeRaw = formData.get("doc_type");
  const docTypeParsed = DocTypeSchema.safeParse(docTypeRaw);
  if (!docTypeParsed.success) {
    return jsonError("Invalid doc_type", 400);
  }
  const doc_type: DocType = docTypeParsed.data;

  const isCompanyShared =
    formData.get("is_company_shared") === "true" ||
    formData.get("is_company_shared") === "1";

  if (isCompanyShared) {
    const forbidden = requireOwner(auth.session);
    if (forbidden) return forbidden;
    if (auth.session.organization.mode !== "team") {
      return jsonError("Company documents require team mode", 400);
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let extracted_text: string | null = null;
  try {
    extracted_text = await parseFile(buffer, fileType);
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Failed to extract text",
      400
    );
  }

  const supabase = createServiceSupabaseClient();
  const orgId = auth.session.organization.id;
  const userId = auth.session.user.id;
  const storagePath = `${orgId}/${userId}/${randomUUID()}-${safeFilename(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return jsonError(`Storage upload failed: ${uploadError.message}`, 500);
  }

  const { data: urlData } = supabase.storage
    .from("documents")
    .getPublicUrl(storagePath);

  const { data: document, error: insertError } = await supabase
    .from("user_documents")
    .insert({
      org_id: orgId,
      user_id: userId,
      filename: file.name,
      file_url: urlData.publicUrl,
      file_size_bytes: file.size,
      file_type: fileType,
      doc_type,
      is_company_shared: isCompanyShared,
      extracted_text,
      embedding_status: "pending",
    })
    .select()
    .single();

  if (insertError || !document) {
    await supabase.storage.from("documents").remove([storagePath]);
    return jsonError(insertError?.message ?? "Failed to save document", 500);
  }

  void embedDocument(document.id).catch(() => {});

  return jsonOk({ document }, 201);
}
