import type { EvaluationResult, FeedbackReportJson } from "@/types";

export function buildFeedbackReport(params: {
  evaluation: EvaluationResult;
  targetName: string;
  conversationType: string;
  transcript: FeedbackReportJson["transcript"];
}): FeedbackReportJson {
  return {
    ...params.evaluation,
    target_name: params.targetName,
    session_date: new Date().toISOString(),
    conversation_type: params.conversationType,
    transcript: params.transcript,
  };
}
