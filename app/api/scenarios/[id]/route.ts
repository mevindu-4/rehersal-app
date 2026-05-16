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
  const { data, error } = await supabase
    .from("scenarios")
    .select("*, target_profiles(*)")
    .eq("id", params.id)
    .eq("org_id", ctx.orgId)
    .single();

  if (error) return jsonError("Scenario not found", 404);
  return jsonOk(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const body = await request.json();
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scenarios")
    .update(body)
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
    .from("scenarios")
    .delete()
    .eq("id", params.id)
    .eq("org_id", ctx.orgId);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
