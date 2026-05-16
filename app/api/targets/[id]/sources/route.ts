import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { getTargetForOrg, incrementSourceCount } from "@/lib/api/targets";
import { createServiceSupabaseClient } from "@/lib/db";
import { AddSourceSchema } from "@/lib/schemas";
import { scrapeUrl } from "@/lib/scraper";

type RouteContext = { params: { id: string } };

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const target = await getTargetForOrg(params.id, auth.session.organization.id);
  if (!target) return jsonError("Target not found", 404);

  const parsed = await parseJsonBody(request, AddSourceSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();
  let status: "pending" | "scraping" | "success" | "failed" | "needs_manual" =
    "pending";
  let raw_text: string | null = null;
  let error_message: string | null = null;

  if (parsed.data.source_type === "url" && parsed.data.url) {
    status = "scraping";
    const scrape = await scrapeUrl(parsed.data.url);
    if (scrape.status === "success") {
      status = "success";
      raw_text = scrape.text ?? null;
    } else if (scrape.status === "needs_manual") {
      status = "needs_manual";
      error_message = scrape.message ?? null;
    } else {
      status = "failed";
      error_message = scrape.message ?? null;
    }
  }

  const { data, error } = await supabase
    .from("target_sources")
    .insert({
      target_profile_id: params.id,
      source_type: parsed.data.source_type,
      url: parsed.data.url ?? null,
      document_id: parsed.data.document_id ?? null,
      manual_text: parsed.data.manual_text ?? null,
      title: parsed.data.title ?? null,
      status,
      raw_text,
      error_message,
      scraped_at: raw_text ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to add source", 500);
  }

  await incrementSourceCount(params.id);

  return jsonOk({ source: data }, 201);
}
