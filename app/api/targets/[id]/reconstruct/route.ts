import { requireAuth } from "@/lib/api/auth";
import { requireOpenAIConfigured } from "@/lib/api/openaiGate";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getTargetForOrg } from "@/lib/api/targets";
import { createServiceSupabaseClient } from "@/lib/db";
import { reconstructTarget } from "@/lib/reconstruction";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

type RouteContext = { params: { id: string } };

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const openaiBlock = requireOpenAIConfigured();
  if (openaiBlock) return openaiBlock;

  const limit = checkRateLimit(
    `reconstruct:${auth.session.user.id}`,
    { maxRequests: 5, windowMs: 60_000 }
  );
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const target = await getTargetForOrg(params.id, auth.session.organization.id);
  if (!target) return jsonError("Target not found", 404);

  const supabase = createServiceSupabaseClient();
  await supabase
    .from("target_profiles")
    .update({ status: "reconstructing" })
    .eq("id", params.id);

  void reconstructTarget(params.id);

  return jsonOk(
    { message: "Reconstruction started", target_id: params.id },
    202
  );
}
