/**
 * Smoke-test prompt builders (no OpenAI calls).
 * Usage: npm run test:prompts
 */
import {
  AVATAR_PROMPTS,
  DIFFICULTY_MODIFIERS,
  buildAvatarBriefPrompt,
  buildAvatarSystemPrompt,
  buildEvaluatorPrompt,
  buildReconstructionPrompt,
  buildReportBuilderPrompt,
} from "../lib/prompts";
import { PersonalityJSONSchema } from "../lib/schemas";
import type { ConversationType, PersonalityJSON } from "../types";

const SAMPLE_PERSONALITY: PersonalityJSON = {
  communication_style: {
    directness: "Direct",
    formality: "Professional",
    pace: "Moderate",
    listening_style: "Active",
  },
  core_values: ["Clarity"],
  typical_question_patterns: ["What evidence supports that?"],
  known_priorities: ["Outcomes"],
  known_skepticisms: ["Vague claims"],
  what_impresses_them: ["Specifics"],
  what_irritates_them: ["Rambling"],
  expertise_areas: ["Negotiation"],
  behavioral_signals: ["Notes when numbers appear"],
  inferred_concerns_by_context: { negotiation: ["Price"] },
  source_citations: { core_values: "Manual notes" },
  confidence: { core_values: "high" },
};

const CONVERSATION_TYPES: ConversationType[] = [
  "job_interview",
  "fundraising_pitch",
  "sales_discovery",
  "difficult_conversation",
  "negotiation",
  "deposition_legal",
  "media_podcast",
  "board_meeting",
  "personal_conversation",
  "custom",
];

function assertIncludes(label: string, text: string, needle: string) {
  if (!text.includes(needle)) {
    throw new Error(`${label}: expected to include "${needle}"`);
  }
}

function main() {
  const reconstruction = buildReconstructionPrompt(
    "=== SOURCE: LinkedIn ===\nExperienced operator."
  );
  assertIncludes("reconstruction", reconstruction, "=== SOURCE:");
  assertIncludes("reconstruction", reconstruction, "source_citations");

  PersonalityJSONSchema.parse(SAMPLE_PERSONALITY);

  const brief = buildAvatarBriefPrompt(SAMPLE_PERSONALITY);
  if (brief.length < 20) throw new Error("avatar brief prompt too short");

  const evaluator = buildEvaluatorPrompt({
    transcript: "User: Hello.\nAvatar: Why now?",
    personality: SAMPLE_PERSONALITY,
    conversationType: "fundraising_pitch",
    goal: "Raise seed round",
    userContext: "We sell B2B SaaS to mid-market.",
    targetName: "Test VC",
  });
  assertIncludes("evaluator", evaluator, "NEVER output hire");
  assertIncludes("evaluator", evaluator, "suggested_answers");

  const report = buildReportBuilderPrompt(
    JSON.stringify({ overall_score: 70 }),
    "Our wedge is workflow automation for finance teams."
  );
  assertIncludes("report", report, "executive_summary");

  for (const type of CONVERSATION_TYPES) {
    const block = AVATAR_PROMPTS[type]({ goal: "Practice goal", durationMinutes: 15 });
    if (block.length < 10) throw new Error(`AVATAR_PROMPTS missing for ${type}`);
  }

  for (const level of [1, 2, 3, 4, 5] as const) {
    const mod = DIFFICULTY_MODIFIERS[level];
    if (!mod) throw new Error(`DIFFICULTY_MODIFIERS missing for ${level}`);
  }

  const d1 = buildAvatarSystemPrompt({
    personaBlock: "You are a skeptical investor.",
    userContextBlock: "Founder deck notes.",
    conversationType: "fundraising_pitch",
    difficulty: 1,
    goal: "Close seed",
    durationMinutes: 15,
  });
  const d5 = buildAvatarSystemPrompt({
    personaBlock: "You are a skeptical investor.",
    userContextBlock: "Founder deck notes.",
    conversationType: "fundraising_pitch",
    difficulty: 5,
    goal: "Close seed",
    durationMinutes: 15,
  });

  if (d1 === d5) throw new Error("Difficulty 1 and 5 prompts should differ");
  assertIncludes("avatar d1", d1, "Patient");
  assertIncludes("avatar d5", d5, "Intense");

  console.log("All prompt smoke tests passed.");
}

main();
