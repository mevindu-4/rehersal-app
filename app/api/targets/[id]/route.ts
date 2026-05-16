import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { getTargetForOrg } from "@/lib/api/targets";
import { createServiceSupabaseClient } from "@/lib/db";
import { UpdateTargetSchema } from "@/lib/schemas";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const target = await getTargetForOrg(params.id, auth.session.organization.id);
  if (!target) return jsonError("Target not found", 404);

  const supabase = createServiceSupabaseClient();
  const { data: sources, error } = await supabase
    .from("target_sources")
    .select("*")
    .eq("target_profile_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return jsonError(error.message, 500);

  return jsonOk({ target, sources: sources ?? [] });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const target = await getTargetForOrg(params.id, auth.session.organization.id);
  if (!target) return jsonError("Target not found", 404);

  const parsed = await parseJsonBody(request, UpdateTargetSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("target_profiles")
    .update(parsed.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to update target", 500);
  }

  return jsonOk({ target: data });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const target = await getTargetForOrg(params.id, auth.session.organization.id);
  if (!target) return jsonError("Target not found", 404);

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase
    .from("target_profiles")
    .delete()
    .eq("id", params.id);

  if (error) return jsonError(error.message, 500);

  return new Response(null, { status: 204 });
}
