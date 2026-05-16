import { getApiContext } from "@/lib/api-auth";
import { getRelevantChunks } from "@/lib/contextRetriever";
import { evaluateSession } from "@/lib/evaluator";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { buildFeedbackReport } from "@/lib/reportBuilder";
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

  await supabase
    .from("sessions")
    .update({ status: "evaluating" })
    .eq("id", params.id);

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", ctx.userId)
    .single();

  if (!session) return jsonError("Session not found", 404);

  const { data: turns } = await supabase
    .from("session_turns")
    .select("*")
    .eq("session_id", params.id)
    .order("sequence");

  const { data: target } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", session.target_profile_id)
    .single();

  const { data: scenario } = await supabase
    .from("scenarios")
    .select("*")
    .eq("id", session.scenario_id)
    .single();

  const transcriptLines = (turns ?? []).map(
    (t) => `[${t.sent_at}] ${t.speaker}: ${t.message}`
  );
  const transcript = transcriptLines.join("\n");

  const userContext = (
    await getRelevantChunks(
      ctx.userId,
      ctx.orgId,
      (scenario?.goal as string) ?? "",
      5
    )
  ).join("\n---\n");

  try {
    const evaluation = await evaluateSession({
      transcript,
      personalityJson: JSON.stringify(target?.personality_json ?? {}),
      scenarioJson: JSON.stringify(scenario ?? {}),
      userContext,
      targetName: target?.name as string | undefined,
    });

    await supabase.from("evaluations").delete().eq("session_id", params.id);
    await supabase.from("evaluations").insert({
      session_id: params.id,
      overall_score: evaluation.overall_score,
      target_fit_score: evaluation.target_fit_score,
      rubric_scores_json: evaluation.rubric_scores,
      missed_signals_json: evaluation.missed_signals,
        evaluator_model: process.env.LLM_PROVIDER === "gemini" || process.env.GEMINI_API_KEY
          ? `gemini-${process.env.GEMINI_MODEL ?? "2.0-flash"}`
          : "claude-sonnet-4-20250514",
      confidence: evaluation.confidence,
    });

    const reportJson = buildFeedbackReport({
      evaluation,
      targetName: (target?.name as string) ?? "Target",
      conversationType: (scenario?.conversation_type as string) ?? "custom",
      transcript: (turns ?? []).map((t) => ({
        speaker: t.speaker as "user" | "avatar",
        message: t.message as string,
        sent_at: t.sent_at as string,
        sequence: t.sequence as number,
      })),
    });

    await supabase.from("feedback_reports").delete().eq("session_id", params.id);
    const { data: report } = await supabase
      .from("feedback_reports")
      .insert({ session_id: params.id, report_json: reportJson })
      .select("id")
      .single();

    await supabase
      .from("sessions")
      .update({ status: "report_ready" })
      .eq("id", params.id);

    return jsonOk({ reportId: report?.id, evaluation });
  } catch (e) {
    await supabase
      .from("sessions")
      .update({ status: "failed" })
      .eq("id", params.id);
    const message = e instanceof Error ? e.message : "Evaluation failed";
    return jsonError(message, 500);
  }
}
