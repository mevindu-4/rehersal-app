import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { reconstructTarget } from "@/lib/reconstruction";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  _request: Request,
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

  try {
    await reconstructTarget(params.id);
    const { data: updated } = await supabase
      .from("target_profiles")
      .select("*")
      .eq("id", params.id)
      .single();
    return jsonOk(updated);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reconstruction failed";
    return jsonError(message, 500);
  }
}
