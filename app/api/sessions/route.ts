import { getApiContext } from "@/lib/api-auth";
import { buildAvatarBrief } from "@/lib/avatarBriefBuilder";
import { createCall, getConfiguredAgentId } from "@/lib/beyondPresence";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createSessionSchema } from "@/lib/schemas";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const { searchParams } = new URL(request.url);
  const targetId = searchParams.get("targetId");

  const supabase = createServiceClient();
  let query = supabase
    .from("sessions")
    .select(
      "*, scenarios(title, conversation_type), target_profiles(name), evaluations(overall_score, target_fit_score), feedback_reports(id)"
    )
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (targetId) query = query.eq("target_profile_id", targetId);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function POST(request: Request) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const body = await request.json();
  const parsed = createSessionSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const supabase = createServiceClient();

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", parsed.data.scenarioId)
    .eq("org_id", ctx.orgId)
    .single();

  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", parsed.data.targetProfileId)
    .eq("org_id", ctx.orgId)
    .single();

  if (!scenario || !target?.personality_json) {
    return jsonError("Scenario or reconstructed target required", 400);
  }

  const brief = await buildAvatarBrief({
    personality: target.personality_json,
    scenario,
    userId: ctx.userId,
    orgId: ctx.orgId,
  });

  const { data: session, error: sessionErr } = await supabase
    .from("sessions")
    .insert({
      user_id: ctx.userId,
      org_id: ctx.orgId,
      scenario_id: parsed.data.scenarioId,
      target_profile_id: parsed.data.targetProfileId,
      status: "created",
    })
    .select()
    .single();

  if (sessionErr || !session) return jsonError(sessionErr?.message ?? "Failed", 500);

  try {
    const call = await createCall({
      agentId: getConfiguredAgentId(),
      userName: ctx.email,
      tags: {
        conversation_type: scenario.conversation_type as string,
      },
      systemPrompt: brief.systemPrompt,
    });

    const { data: updated } = await supabase
      .from("sessions")
      .update({
        bey_call_id: call.id,
        bey_agent_id: getConfiguredAgentId(),
        join_url: call.livekit_url,
        livekit_token: call.livekit_token ?? null,
        status: "ready",
      })
      .eq("id", session.id)
      .select()
      .single();

    return jsonOk({
      sessionId: session.id,
      livekitUrl: call.livekit_url,
      livekitToken: call.livekit_token,
      session: updated,
      briefPreview: brief.plainEnglishPreview,
    });
  } catch (e) {
    await supabase
      .from("sessions")
      .update({ status: "failed" })
      .eq("id", session.id);
    const message = e instanceof Error ? e.message : "Call creation failed";
    return jsonError(message, 500);
  }
}
