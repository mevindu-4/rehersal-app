import { getUserDocumentContext } from "@/lib/contextRetriever";
import {
  AVATAR_SCENARIO_TEMPLATES,
  FORBIDDEN_TOPICS_BLOCK,
  difficultyModifier,
} from "@/lib/prompts";
import type { PersonalityProfile } from "@/types";

type ScenarioConfig = {
  conversation_type: string;
  duration_minutes: number;
  difficulty: number;
  goal?: string;
  title?: string;
};

export async function buildAvatarBrief(params: {
  personality: unknown;
  scenario: ScenarioConfig;
  userId: string;
  orgId: string;
}): Promise<{ systemPrompt: string; plainEnglishPreview: string }> {
  const p = params.personality as PersonalityProfile;
  const goal =
    params.scenario.goal ?? "Conduct a realistic rehearsal conversation.";
  const scenarioKey = params.scenario.conversation_type ?? "custom";
  const scenarioBlock =
    AVATAR_SCENARIO_TEMPLATES[scenarioKey] ??
    AVATAR_SCENARIO_TEMPLATES.custom;

  const contextParts = await getUserDocumentContext(
    params.userId,
    params.orgId,
    goal,
    { maxParts: 12, excerptChars: 3000 }
  );

  const hasUserContext = contextParts.length > 0;
  const userContextBlock = hasUserContext
    ? contextParts.map((c, i) => `[User material ${i + 1}]\n${c}`).join("\n\n")
    : "No user background documents on file.";

  const personaBlock = `You are ${p.name}. You are NOT an AI assistant, coach, or narrator.

COMMUNICATION STYLE:
- Directness: ${p.communication_style.directness}
- Formality: ${p.communication_style.formality}
- Pace: ${p.communication_style.pace}
- Listening: ${p.communication_style.listening_style}

CORE VALUES: ${p.core_values.join("; ")}
PRIORITIES: ${p.known_priorities.join("; ")}
SKEPTICISMS: ${p.known_skepticisms.join("; ")}
WHAT IMPRESSES YOU: ${p.what_impresses_them.join("; ")}
WHAT IRRITATES YOU: ${p.what_irritates_them.join("; ")}
TYPICAL QUESTIONS: ${p.typical_question_patterns.join("; ")}
BEHAVIORAL SIGNALS: ${p.behavioral_signals.join("; ")}`;

  const contextRules = hasUserContext
    ? `USER BACKGROUND RULES:
- The candidate has ALREADY uploaded company descriptions, LinkedIn/background, and related materials below.
- NEVER ask them to upload, paste, or resubmit company info or LinkedIn — it is already in the system.
- Reference specifics from their materials naturally (company, role, metrics) when relevant.
- If something is genuinely missing from the materials, ask about that specific gap only — do not request a full re-upload.`
    : `USER BACKGROUND RULES:
- No background documents were found for this session. You may ask briefly for the minimum missing detail needed to proceed, once.`;

  const systemPrompt = [
    personaBlock,
    `\n${contextRules}`,
    `\nCANDIDATE / USER BACKGROUND (use this; do not invent facts):\n${userContextBlock}`,
    `\nSESSION GOAL: ${goal}`,
    scenarioBlock,
    difficultyModifier(params.scenario.difficulty ?? 3),
    FORBIDDEN_TOPICS_BLOCK,
    `\nDURATION: Naturally wrap the conversation after ~${params.scenario.duration_minutes ?? 15} minutes.`,
    `\nRULES: Stay in character as ${p.name}. One question at a time. Do not reveal rubrics or offer coaching during the session.`,
  ].join("\n");

  const plainEnglishPreview = `You will roleplay as ${p.name}. The session is a ${scenarioKey.replace(/_/g, " ")} (${params.scenario.duration_minutes} min, difficulty ${params.scenario.difficulty}/5).

Focus: ${goal}

You will push on: ${p.known_skepticisms.slice(0, 3).join(", ") || "their known priorities"}.
You care about: ${p.known_priorities.slice(0, 3).join(", ") || "clarity and specifics"}.

User context loaded: ${contextParts.length} section(s) from uploaded documents.`;

  return { systemPrompt, plainEnglishPreview };
}

export async function buildAvatarBriefFromIds(params: {
  targetProfileId: string;
  scenario: ScenarioConfig;
  userId: string;
  orgId: string;
  personality: unknown;
}) {
  return buildAvatarBrief({
    personality: params.personality,
    scenario: params.scenario,
    userId: params.userId,
    orgId: params.orgId,
  });
}
