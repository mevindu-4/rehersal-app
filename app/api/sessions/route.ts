import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { buildAvatarSystemPrompt } from "@/lib/avatarBriefBuilder";
import { createCall } from "@/lib/beyondPresence";
import { retrieveContext } from "@/lib/contextRetriever";
import { createServiceSupabaseClient } from "@/lib/db";
import { CreateSessionSchema } from "@/lib/schemas";
import { checkRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import type {
  Scenario,
  SessionHistoryItem,
  SessionStatus,
  TargetProfile,
} from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as SessionStatus | null;
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "20", 10) || 20,
    100
  );
  const userIdFilter = searchParams.get("user_id");
  const isCoach =
    auth.session.membership.role === "owner" ||
    auth.session.membership.role === "coach";

  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("sessions")
    .select(
      "*, scenarios(*), target_profiles(*), evaluations(overall_score, target_fit_score)"
    )
    .eq("org_id", auth.session.organization.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) query = query.eq("status", status);

  if (userIdFilter && isCoach) {
    query = query.eq("user_id", userIdFilter);
  } else if (!isCoach) {
    query = query.eq("user_id", auth.session.user.id);
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  const sessions: SessionHistoryItem[] = (data ?? []).map((row) => {
    const { scenarios, target_profiles, evaluations, ...session } = row as Record<
      string,
      unknown
    >;
    const evalRow = Array.isArray(evaluations)
      ? evaluations[0]
      : evaluations;
    return {
      session: session as unknown as SessionHistoryItem["session"],
      scenario: scenarios as Scenario | undefined,
      target: target_profiles as TargetProfile | undefined,
      evaluation: evalRow as SessionHistoryItem["evaluation"],
    };
  });

  return jsonOk({ sessions });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const limit = checkRateLimit(`session:${auth.session.user.id}`, {
    maxRequests: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) return rateLimitResponse(limit.resetAt);

  const parsed = await parseJsonBody(request, CreateSessionSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();

  const { data: scenario, error: scenarioError } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", parsed.data.scenario_id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (scenarioError || !scenario) {
    return jsonError("Scenario not found", 404);
  }

  const { data: target, error: targetError } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", scenario.target_profile_id)
    .single();

  if (targetError || !target) {
    return jsonError("Target not found", 404);
  }

  if (target.status !== "complete") {
    return jsonError("Target profile must be complete before starting a session", 400);
  }

  const userContext = await retrieveContext({
    orgId: auth.session.organization.id,
    userId: auth.session.user.id,
    goal: scenario.goal,
    includeCompany: auth.session.organization.mode === "team",
  });

  const systemPrompt = buildAvatarSystemPrompt({
    target: target as TargetProfile,
    scenario: scenario as Scenario,
    userContextBlock: userContext,
  });

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      org_id: auth.session.organization.id,
      user_id: auth.session.user.id,
      scenario_id: scenario.id,
      target_profile_id: target.id,
      assignment_id: parsed.data.assignment_id ?? null,
      status: "created",
    })
    .select()
    .single();

  if (sessionError || !session) {
    return jsonError(sessionError?.message ?? "Failed to create session", 500);
  }

  try {
    const call = await createCall({
      userName: auth.session.user.name ?? auth.session.user.email,
      systemPromptOverride: systemPrompt,
      tags: {
        source: "rehearsal",
        session_id: session.id,
      },
    });

    const { data: readySession, error: updateError } = await supabase
      .from("sessions")
      .update({
        bey_call_id: call.id,
        bey_agent_id: call.agent_id,
        join_url: call.join_url,
        system_prompt_used: systemPrompt,
        status: "ready",
        started_at: new Date().toISOString(),
      })
      .eq("id", session.id)
      .select()
      .single();

    if (updateError || !readySession) {
      throw updateError ?? new Error("Failed to update session");
    }

    const { system_prompt_used: _prompt, ...safeSession } = readySession;

    return jsonOk(
      {
        session: safeSession,
        join_url: call.join_url,
      },
      201
    );
  } catch (e) {
    await supabase
      .from("sessions")
      .update({
        status: "failed",
        error_message: e instanceof Error ? e.message : "Failed to start call",
      })
      .eq("id", session.id);

    return jsonError(
      e instanceof Error ? e.message : "Failed to create Beyond Presence call",
      500
    );
  }
}
