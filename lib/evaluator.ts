import { callLlm, isDemoMode, parseJsonFromLlm } from "@/lib/llm";
import {
  EVALUATOR_SYSTEM_PROMPT,
  buildEvaluatorUserMessage,
} from "@/lib/prompts";
import { evaluationSchema } from "@/lib/schemas";
import { isLlmUnavailableError, mockEvaluation } from "@/lib/demoMocks";
import type { EvaluationResult } from "@/types";

export async function evaluateSession(params: {
  transcript: string;
  personalityJson: string;
  scenarioJson: string;
  userContext: string;
  targetName?: string;
}): Promise<EvaluationResult> {
  if (isDemoMode()) {
    const name =
      params.targetName ??
      (JSON.parse(params.personalityJson) as { name?: string }).name ??
      "Target";
    return mockEvaluation(name, params.transcript);
  }

  try {
    const userMessage = buildEvaluatorUserMessage(params);
    const raw = await callLlm(EVALUATOR_SYSTEM_PROMPT, userMessage, {
      maxTokens: 8192,
    });
    const parsed = parseJsonFromLlm<EvaluationResult>(raw);
    return evaluationSchema.parse(parsed);
  } catch (e) {
    if (!isLlmUnavailableError(e)) throw e;
    const name =
      params.targetName ??
      (JSON.parse(params.personalityJson) as { name?: string }).name ??
      "Target";
    return mockEvaluation(name, params.transcript);
  }
}
