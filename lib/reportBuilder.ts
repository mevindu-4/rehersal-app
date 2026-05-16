import { createServiceSupabaseClient } from "@/lib/db";
import { completionJSON } from "@/lib/openai";
import { buildReportBuilderPrompt, PROMPT_VERSION } from "@/lib/prompts";
import {
  EvaluationSchema,
  FeedbackReportSchema,
  validateAISafety,
} from "@/lib/schemas";
import type { z } from "zod";
import type { ConversationType, FeedbackReportJSON } from "@/types";

type EvaluationResult = z.infer<typeof EvaluationSchema>;

export async function buildFeedbackReport(
  sessionId: string,
  evaluation: EvaluationResult,
  userContext: string
): Promise<string> {
  const supabase = createServiceSupabaseClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*, scenarios(*), target_profiles(*)")
    .eq("id", sessionId)
    .single();

  if (!session) throw new Error("Session not found");

  const scenario = session.scenarios as {
    conversation_type: ConversationType;
    goal: string;
  };
  const target = session.target_profiles as { name: string };

  const reportPayload = await completionJSON(
    buildReportBuilderPrompt(JSON.stringify(evaluation), userContext, {
      targetName: target.name,
      conversationType: scenario.conversation_type,
      sessionDate: session.ended_at ?? session.created_at,
    }),
    FeedbackReportSchema
  );

  const report_json: FeedbackReportJSON = {
    ...reportPayload,
    executive_summary:
      reportPayload.executive_summary || evaluation.summary,
    overall_score: evaluation.overall_score,
    target_fit_score: evaluation.target_fit_score,
    conversation_type: scenario.conversation_type,
    target_name: target.name,
    session_date: session.ended_at ?? session.created_at,
  };

  const reportSafety = validateAISafety(JSON.stringify(report_json));
  if (!reportSafety.safe) {
    throw new Error(
      `Report blocked by safety filter: ${reportSafety.matches.join(", ")}`
    );
  }

  const { data: report, error } = await supabase
    .from("feedback_reports")
    .upsert(
      {
        session_id: sessionId,
        report_json,
      },
      { onConflict: "session_id" }
    )
    .select("id")
    .single();

  if (error || !report) throw error ?? new Error("Failed to save report");

  await supabase
    .from("sessions")
    .update({ status: "report_ready" })
    .eq("id", sessionId);

  return report.id;
}
