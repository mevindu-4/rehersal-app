import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { detectFileType, extractFileText, FileParseError } from "@/lib/fileParser";
import { addSourceSchema } from "@/lib/schemas";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function inferSourceType(url?: string, explicit?: string): string {
  if (explicit) return explicit;
  if (!url) return "manual";
  const u = url.toLowerCase();
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("podcast") || u.includes("spotify.com")) return "podcast";
  return "article";
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data: target } = await supabase
    .from("target_profiles")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", ctx.orgId)
    .single();

  if (!target) return jsonError("Target not found", 404);

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) return jsonError("No file provided");

    const fileType = detectFileType(file.name);
    if (!fileType) return jsonError("Unsupported file type");

    const buffer = Buffer.from(await file.arrayBuffer());
    let raw_text: string;
    try {
      raw_text = await extractFileText(buffer, fileType);
    } catch (e) {
      const message =
        e instanceof FileParseError
          ? e.message
          : e instanceof Error
            ? e.message
            : "Failed to parse file";
      return jsonError(message, 422);
    }

    const { data, error } = await supabase
      .from("target_sources")
      .insert({
        target_profile_id: params.id,
        source_type: "document",
        raw_text,
        status: "complete",
        scraped_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return jsonError(error.message, 500);
    return jsonOk(data, 201);
  }

  const body = await request.json();
  const parsed = addSourceSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const source_type = inferSourceType(parsed.data.url, parsed.data.source_type);

  const { data, error } = await supabase
    .from("target_sources")
    .insert({
      target_profile_id: params.id,
      url: parsed.data.url ?? null,
      source_type,
      raw_text: parsed.data.raw_text ?? null,
      status: parsed.data.raw_text ? "complete" : "pending",
      scraped_at: parsed.data.raw_text ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
