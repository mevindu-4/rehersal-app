import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import {
  detectFileType,
  detectFileTypeFromMime,
  extractFileText,
  FileParseError,
} from "@/lib/fileParser";
import { embedDocument } from "@/lib/embeddings";
import { createServiceClient } from "@/lib/supabase/server";
import { z } from "zod";

export const runtime = "nodejs";

const manualDocSchema = z.object({
  doc_type: z
    .enum([
      "my_background",
      "opportunity",
      "company",
      "product",
      "prior_interactions",
      "other",
    ])
    .default("other"),
  text: z.string().min(1, "Text is required"),
  filename: z.string().optional(),
});

export async function GET() {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("user_documents")
    .select("*")
    .eq("user_id", ctx.userId)
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

async function saveDocument(params: {
  ctx: NonNullable<Awaited<ReturnType<typeof getApiContext>>>;
  filename: string;
  fileType: "pdf" | "docx" | "txt";
  extracted_text: string;
  doc_type: string;
  buffer?: Buffer;
  contentType?: string;
}) {
  const { ctx, filename, fileType, extracted_text, doc_type, buffer, contentType } =
    params;

  const supabase = createServiceClient();
  const path = `${ctx.userId}/${Date.now()}-${filename}`;

  let file_url = `local://${path}`;
  if (buffer) {
    const { error: uploadErr } = await supabase.storage
      .from("documents")
      .upload(path, buffer, {
        contentType: contentType ?? "application/octet-stream",
        upsert: true,
      });

    if (!uploadErr) {
      file_url = supabase.storage.from("documents").getPublicUrl(path).data.publicUrl;
    }
  }

  const { data, error } = await supabase
    .from("user_documents")
    .insert({
      user_id: ctx.userId,
      org_id: ctx.orgId,
      filename,
      file_url,
      file_type: fileType,
      extracted_text,
      doc_type,
    })
    .select()
    .single();

  if (error) return { error: jsonError(error.message, 500) };
  if (extracted_text) {
    try {
      await embedDocument(data.id, extracted_text);
    } catch (e) {
      console.warn("[documents] embedding failed:", e);
    }
  }
  return { data };
}

export async function POST(request: Request) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    const parsed = manualDocSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message ?? "Invalid request", 400);
    }

    const text = parsed.data.text.trim();
    if (text.length < 20) {
      return jsonError("Please provide at least 20 characters of text.", 400);
    }

    const result = await saveDocument({
      ctx,
      filename: parsed.data.filename ?? "pasted-text.txt",
      fileType: "txt",
      extracted_text: text,
      doc_type: parsed.data.doc_type,
    });
    if ("error" in result && result.error) return result.error;
    return jsonOk(result.data, 201);
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const doc_type = (form.get("doc_type") as string) || "other";

  if (!file) return jsonError("No file provided", 400);

  const fileType =
    detectFileTypeFromMime(file.type, file.name) ?? detectFileType(file.name);
  if (!fileType) {
    return jsonError("Unsupported file type. Use PDF, DOCX, or TXT.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let extracted_text: string;
  try {
    extracted_text = await extractFileText(buffer, fileType);
  } catch (e) {
    const message =
      e instanceof FileParseError
        ? e.message
        : e instanceof Error
          ? e.message
          : "Failed to parse file";
    return jsonError(message, 422);
  }

  const result = await saveDocument({
    ctx,
    filename: file.name,
    fileType,
    extracted_text,
    doc_type,
    buffer,
    contentType: file.type,
  });
  if ("error" in result && result.error) return result.error;
  return jsonOk(result.data, 201);
}
