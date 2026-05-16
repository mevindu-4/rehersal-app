import { createServiceSupabaseClient } from "@/lib/db";
import { completionJSON } from "@/lib/openai";
import { retrieveContext } from "@/lib/contextRetriever";
import { buildEvaluatorPrompt, PROMPT_VERSION } from "@/lib/prompts";
import { buildFeedbackReport } from "@/lib/reportBuilder";
import { EvaluationSchema, validateAISafety } from "@/lib/schemas";
import { formatTranscript, syncSessionTurns } from "@/lib/sessionTurns";
import type {
  Organization,
  PersonalityJSON,
  Scenario,
  Session,
  TargetProfile,
} from "@/types";

const EVALUATOR_MODEL = "gpt-4o";

export async function evaluateSession(sessionId: string): Promise<void> {
  const supabase = createServiceSupabaseClient();

  const { data: sessionRow, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !sessionRow) throw new Error("Session not found");

  const session = sessionRow as Session;

  await supabase
    .from("sessions")
    .update({ status: "evaluating" })
    .eq("id", sessionId);

  try {
    const { data: turns } = await supabase
      .from("session_turns")
      .select("*")
      .eq("session_id", sessionId)
      .order("sequence", { ascending: true });

    if (!turns?.length && session.bey_call_id) {
      await syncSessionTurns(sessionId);
    }

    const { data: turnsAfter } = await supabase
      .from("session_turns")
      .select("*")
      .eq("session_id", sessionId)
      .order("sequence", { ascending: true });

    const { data: scenario } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", session.scenario_id)
      .single();

    const { data: target } = await supabase
      .from("target_profiles")
      .select("*")
      .eq("id", session.target_profile_id)
      .single();

    const { data: org } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", session.org_id)
      .single();

    if (!scenario || !target) throw new Error("Missing scenario or target");

    const personality = target.personality_json as PersonalityJSON | null;
    if (!personality) {
      throw new Error("Target personality not available for evaluation");
    }

    const userContext = await retrieveContext({
      orgId: session.org_id,
      userId: session.user_id,
      goal: (scenario as Scenario).goal,
      includeCompany: (org as Organization).mode === "team",
    });

    const transcript = formatTranscript(turnsAfter ?? []);

    const evaluation = await completionJSON(
      buildEvaluatorPrompt({
        transcript,
        personality,
        conversationType: (scenario as Scenario).conversation_type,
        goal: (scenario as Scenario).goal,
        userContext,
        targetName: (target as TargetProfile).name,
      }),
      EvaluationSchema
    );

    const evalSafety = validateAISafety(JSON.stringify(evaluation));
    if (!evalSafety.safe) {
      throw new Error(
        `Evaluation blocked by safety filter: ${evalSafety.matches.join(", ")}`
      );
    }

    await supabase.from("evaluations").upsert(
      {
        session_id: sessionId,
        overall_score: evaluation.overall_score,
        target_fit_score: evaluation.target_fit_score,
        rubric_scores_json: evaluation.rubric_scores,
        missed_signals_json: evaluation.missed_signals,
        confidence: evaluation.confidence,
        evaluator_model: EVALUATOR_MODEL,
        prompt_version: PROMPT_VERSION,
      },
      { onConflict: "session_id" }
    );

    await buildFeedbackReport(sessionId, evaluation, userContext);

    await supabase
      .from("target_profiles")
      .update({
        session_count: ((target as TargetProfile).session_count ?? 0) + 1,
      })
      .eq("id", target.id);
  } catch (e) {
    await supabase
      .from("sessions")
      .update({
        status: "failed",
        error_message:
          e instanceof Error ? e.message : "Evaluation failed",
      })
      .eq("id", sessionId);
    throw e;
  }
}
