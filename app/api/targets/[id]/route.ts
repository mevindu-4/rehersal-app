import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data: target, error } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", ctx.orgId)
    .single();

  if (error || !target) return jsonError("Target not found", 404);

  const { data: sources } = await supabase
    .from("target_sources")
    .select("*")
    .eq("target_profile_id", params.id)
    .order("scraped_at", { ascending: false });

  return jsonOk({ ...target, sources: sources ?? [] });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const body = await request.json();
  const supabase = createServiceClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (body.name) updates.name = body.name;
  if (body.title !== undefined) updates.title = body.title;
  if (body.company !== undefined) updates.company = body.company;
  if (body.domain !== undefined) updates.domain = body.domain;
  if (body.personality_json) updates.personality_json = body.personality_json;

  const { data, error } = await supabase
    .from("target_profiles")
    .update(updates)
    .eq("id", params.id)
    .eq("org_id", ctx.orgId)
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("target_profiles")
    .delete()
    .eq("id", params.id)
    .eq("org_id", ctx.orgId);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
