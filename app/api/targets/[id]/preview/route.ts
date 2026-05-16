import { getApiContext } from "@/lib/api-auth";
import { buildAvatarBrief } from "@/lib/avatarBriefBuilder";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenarioId");

  const supabase = createServiceClient();
  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", ctx.orgId)
    .single();

  if (!target?.personality_json) {
    return jsonError("Target profile not reconstructed yet", 400);
  }

  let scenario = {
    conversation_type: "job_interview",
    duration_minutes: 15,
    difficulty: 3,
    goal: "Practice the conversation",
  };

  if (scenarioId) {
    const { data: s } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", scenarioId)
      .eq("org_id", ctx.orgId)
      .single();
    if (s) scenario = s as typeof scenario;
  }

  const brief = await buildAvatarBrief({
    personality: target.personality_json,
    scenario,
    userId: ctx.userId,
    orgId: ctx.orgId,
  });

  return jsonOk(brief);
}
