import type { EvaluationResult, PersonalityProfile } from "@/types";

export function isLlmUnavailableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("credit balance is too low") ||
    msg.includes("ANTHROPIC_API_KEY is not configured") ||
    msg.includes("GEMINI_API_KEY") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("quota") ||
    msg.includes("invalid x-api-key") ||
    msg.includes("API key not valid") ||
    msg.includes("authentication") ||
    msg.includes("No LLM configured")
  );
}

/** @deprecated */
export const isAnthropicUnavailableError = isLlmUnavailableError;

export function mockPersonalityProfile(
  targetName: string,
  rawSnippet: string
): PersonalityProfile {
  const excerpt = rawSnippet.slice(0, 200).replace(/\s+/g, " ");
  return {
    name: targetName,
    communication_style: {
      directness: "Direct (demo profile — add Gemini or Anthropic API key for full synthesis)",
      formality: "Professional",
      pace: "Moderate",
      listening_style: "Probes for specifics when answers are vague",
    },
    core_values: ["Clarity", "Evidence-based claims", "Preparedness"],
    typical_question_patterns: [
      "Can you walk me through a specific example?",
      "What metric showed that worked?",
      "What would you do differently?",
    ],
    known_priorities: ["Concrete outcomes", "Honest tradeoffs", "Relevant experience"],
    known_skepticisms: ["Vague generalities", "Unsupported claims"],
    what_impresses_them: ["Specific metrics", "Clear structure", "Self-awareness"],
    what_irritates_them: ["Rambling", "Buzzwords without substance"],
    expertise_areas: ["Professional conversations"],
    behavioral_signals: ["Follows up once when answers lack detail"],
    inferred_concerns_by_context: {
      interview: ["Role fit", "Impact with metrics"],
      fundraising: ["Market and unit economics"],
      sales: ["Budget and timeline"],
      negotiation: ["Mutual value and terms"],
    },
    source_citations: {
      core_values: excerpt
        ? `Demo synthesis from provided text: "${excerpt}…"`
        : "Demo profile — no source text provided",
    },
    confidence: {
      core_values: excerpt ? "medium" : "low",
      typical_question_patterns: "low",
    },
  };
}

export function mockEvaluation(
  targetName: string,
  transcript: string
): EvaluationResult {
  const hasMetrics = /\d+%|\d+\s*(ms|min|hours|days|users|customers)/i.test(
    transcript
  );
  const overall = hasMetrics ? 72 : 58;
  return {
    overall_score: overall,
    target_fit_score: overall - 5,
    confidence: "low",
    summary: `Demo report for your rehearsal with ${targetName}. This is placeholder feedback because no LLM API is configured or credits are unavailable. Add a Gemini or Anthropic key for full coaching.`,
    rubric_scores: [
      {
        criterion: "Specificity",
        score: hasMetrics ? 7 : 4,
        max_score: 10,
        evidence: hasMetrics
          ? "Transcript includes at least one quantified claim."
          : "Answers lacked clear metrics.",
        improvement: "Anchor stories with one measurable outcome each.",
      },
    ],
    best_moments: [
      {
        timestamp: "00:00",
        note: "You engaged with the opening question.",
        why_it_worked_for_target: `${targetName} values candidates who answer directly.`,
      },
    ],
    weak_moments: [
      {
        timestamp: "00:30",
        note: "Response could include a clearer result.",
        why_it_matters_for_target: `Known pattern: ${targetName} follows up on vague answers.`,
      },
    ],
    missed_signals: [],
    suggested_answers: [
      {
        moment_timestamp: "00:30",
        original: "(your answer)",
        stronger_version:
          "In that situation I reduced deploy time by 30% over six weeks by…",
        grounded_in: "Use a real metric from your uploaded documents when available.",
      },
    ],
    communication_notes: {
      filler_word_count: 0,
      directness_score: 6,
      structure_score: 6,
      clarity_score: 6,
    },
    next_practice: "Re-run after configuring Gemini or Anthropic for full target-specific feedback.",
  };
}
