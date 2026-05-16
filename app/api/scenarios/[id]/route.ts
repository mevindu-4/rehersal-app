import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { scenarioBelongsToOrg } from "@/lib/api/org";
import { createServiceSupabaseClient } from "@/lib/db";
import { ScenarioConfigSchema } from "@/lib/schemas";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const belongs = await scenarioBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Scenario not found", 404);

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !data) return jsonError("Scenario not found", 404);

  return jsonOk({ scenario: data });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const belongs = await scenarioBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Scenario not found", 404);

  const parsed = await parseJsonBody(
    request,
    ScenarioConfigSchema.partial()
  );
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("scenarios")
    .update(parsed.data)
    .eq("id", params.id)
    .select()
    .single();

  if (error || !data) return jsonError(error?.message ?? "Update failed", 500);

  return jsonOk({ scenario: data });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const belongs = await scenarioBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Scenario not found", 404);

  const supabase = createServiceSupabaseClient();
  const { error } = await supabase.from("scenarios").delete().eq("id", params.id);

  if (error) return jsonError(error.message, 500);

  return new Response(null, { status: 204 });
}
