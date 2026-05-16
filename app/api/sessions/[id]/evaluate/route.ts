import { requireAuth } from "@/lib/api/auth";
import { requireOpenAIConfigured } from "@/lib/api/openaiGate";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { evaluateSession } from "@/lib/evaluator";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";

type RouteContext = { params: { id: string } };

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const openaiBlock = requireOpenAIConfigured();
  if (openaiBlock) return openaiBlock;

  const limit = checkRateLimit(`evaluate:${auth.session.user.id}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const supabase = createServiceSupabaseClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, user_id, org_id")
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (!session) return jsonError("Session not found", 404);
  if (session.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  void evaluateSession(params.id);

  return jsonOk({ message: "Evaluation started" }, 202);
}
