import type { ConversationType, PersonalityJSON } from "@/types";

/** Bump when evaluator/reconstruction prompt text changes (stored on evaluations rows). */
export const PROMPT_VERSION = "eval-v1.0";

// ─── Shared safety blocks ─────────────────────────────────────────────────────

const FORBIDDEN_TOPICS_BLOCK = `FORBIDDEN TOPICS (never ask or discuss):
- Protected characteristics (age, gender, race, ethnicity, religion, disability, sexual orientation)
- Medical or mental health status
- Family or marital status (unless this is explicitly a personal_conversation about that topic)
- Political affiliation
- Anything outside the scope of this scenario`;

const AVATAR_BEHAVIOR_RULES = `BEHAVIOR RULES:
- Ask one question at a time
- Stay in character as the target person at all times
- Use natural follow-ups based on what the user says
- Never reveal you are evaluating, coaching, or an AI assistant
- Never provide coaching during the session
- Never reference a rubric or scorecard`;

// ─── Difficulty modifiers (1–5) ───────────────────────────────────────────────

export const DIFFICULTY_MODIFIERS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "DIFFICULTY (Patient): Be supportive and encouraging. Let the user finish thoughts. Use gentle prompts only.",
  2: "DIFFICULTY (Conversational): Stay warm with light follow-ups. Do not apply heavy pressure.",
  3: "DIFFICULTY (Standard): Maintain professional, balanced pacing with natural follow-up questions.",
  4: "DIFFICULTY (Demanding): Probe weaknesses directly. Interrupt vague or evasive answers. Apply steady pressure.",
  5: "DIFFICULTY (Intense): Use uncomfortable silences. Be highly skeptical. Rapid follow-ups when answers lack specifics.",
};

// ─── Avatar prompts by conversation type ──────────────────────────────────────

export interface AvatarPromptContext {
  goal: string;
  durationMinutes: number;
}

export const AVATAR_PROMPTS: Record<
  ConversationType,
  (ctx: AvatarPromptContext) => string
> = {
  job_interview: () =>
    "TYPE-SPECIFIC (Job interview): Use behavioral STAR-style questions. Probe depth on ownership, metrics, and trade-offs. Follow up when answers stay at 'we' instead of 'I'.",
  fundraising_pitch: () =>
    "TYPE-SPECIFIC (Fundraising): Challenge unit economics, market timing, wedge, and competition. Ask 'why now' and push on assumptions behind TAM.",
  sales_discovery: () =>
    "TYPE-SPECIFIC (Sales discovery): Explore pain, budget, authority, timeline, and decision process. Push back on generic value claims.",
  difficult_conversation: () =>
    "TYPE-SPECIFIC (Difficult conversation): Address tension directly. Stay on the issue. Acknowledge emotion without avoiding accountability.",
  negotiation: () =>
    "TYPE-SPECIFIC (Negotiation): Use anchoring, test trade-offs, and strategic silence. Do not concede without getting something in return.",
  deposition_legal: () =>
    "TYPE-SPECIFIC (Deposition): Ask precise, narrow questions. Impeach inconsistencies. Maintain formal, controlled tone.",
  media_podcast: () =>
    "TYPE-SPECIFIC (Media/podcast): Push for sound bites and quotable lines. Use bridging when the user is evasive. Ask provocative but fair questions.",
  board_meeting: () =>
    "TYPE-SPECIFIC (Board meeting): Focus on strategy, governance, risk, and resource trade-offs. Challenge requests that lack supporting data.",
  personal_conversation: () =>
    "TYPE-SPECIFIC (Personal): Prioritize emotional nuance, boundaries, and empathy. Listen actively. Avoid judgmental framing.",
  custom: (ctx) =>
    `TYPE-SPECIFIC (Custom): Follow the user's scenario goal as the primary driver:\n${ctx.goal}`,
};

// ─── 1. Reconstruction ────────────────────────────────────────────────────────

export function buildReconstructionPrompt(labeledSources: string): string {
  return `You are analyzing public and user-provided sources to build a structured personality profile of a conversation target.

SOURCES (labeled):
${labeledSources}

Extract a personality profile as JSON with these exact fields:
- communication_style: { directness, formality, pace, listening_style }
- core_values: string[]
- typical_question_patterns: string[]
- known_priorities: string[]
- known_skepticisms: string[]
- what_impresses_them: string[]
- what_irritates_them: string[]
- expertise_areas: string[]
- behavioral_signals: string[]
- inferred_concerns_by_context: object mapping conversation type enums (e.g. job_interview, fundraising_pitch) to string arrays
- source_citations: object mapping field names to source name or URL
- confidence: object mapping field names to "high" | "medium" | "low"

Rules:
- Include source_citations for every populated field (source label or URL from the labeled blocks)
- Never assign "high" confidence without clear evidence in the sources
- Mark confidence honestly per field
- Do not invent facts; use empty arrays when evidence is missing
- Output ONLY valid JSON — no markdown, no preamble, no code fences`;
}

/** @deprecated Use buildReconstructionPrompt */
export function reconstructionPrompt(sourceText: string): string {
  const labeled = sourceText.includes("===")
    ? sourceText
    : sourceText
        .split(/\n### /)
        .filter(Boolean)
        .map((chunk, i) => {
          const trimmed = chunk.trim();
          if (i === 0 && !trimmed.startsWith("===")) {
            return `=== SOURCE: Block ${i + 1} ===\n${trimmed}`;
          }
          return trimmed.startsWith("===") ? trimmed : `=== SOURCE: ${trimmed.split("\n")[0]} ===\n${trimmed}`;
        })
        .join("\n\n");
  return buildReconstructionPrompt(labeled);
}

// ─── 6. Avatar brief generator ────────────────────────────────────────────────

export function buildAvatarBriefPrompt(personality: PersonalityJSON): string {
  return `Given this personality profile JSON, write a 3–4 sentence avatar brief template that captures how this person communicates in high-stakes conversations. Be specific to this profile, not generic.

PROFILE:
${JSON.stringify(personality, null, 2)}

Output plain text only — no JSON, no markdown.`;
}

/** @deprecated Use buildAvatarBriefPrompt */
export const avatarBriefTemplatePrompt = buildAvatarBriefPrompt;

// ─── 4. Evaluator ─────────────────────────────────────────────────────────────

export interface EvaluatorPromptInput {
  transcript: string;
  personality: PersonalityJSON;
  conversationType: ConversationType;
  goal: string;
  userContext: string;
  targetName?: string;
}

export function buildEvaluatorPrompt(params: EvaluatorPromptInput): string {
  return `You are an expert conversation coach evaluating a rehearsal session. Score only observable behavior with transcript evidence.

TARGET PERSONALITY:
${JSON.stringify(params.personality, null, 2)}

SCENARIO:
Type: ${params.conversationType}
Goal: ${params.goal}
${params.targetName ? `Target name: ${params.targetName}` : ""}

USER CONTEXT (their background materials — use vocabulary from here in suggested_answers):
${params.userContext}

TRANSCRIPT:
${params.transcript}

Evaluate the user's performance. Output JSON with:
- overall_score (0–100)
- target_fit_score (0–100) — how well they matched this target's style and priorities
- confidence: "high" | "medium" | "low"
- summary: 2–4 sentences specific to this target (not generic coaching)
- rubric_scores: array of { dimension, score (0–100), evidence } — each evidence must quote or paraphrase the transcript
- best_moments: array of { timestamp, user_said, reason } — reason must explain why this worked for THIS target
- weak_moments: array of { timestamp, user_said, reason }
- missed_signals: array of { timestamp, avatar_signal, likely_meaning }
- suggested_answers: array of { timestamp, original, suggested, rationale } — reuse phrases from user context documents where possible
- communication_notes: { filler_words_count, directness (0–10), structure (0–10), clarity (0–10) }

SAFETY RULES (NON-NEGOTIABLE):
- NEVER output hire/no-hire recommendations or hiring decisions
- NEVER infer honesty, intelligence, mental health, personality disorders, or protected traits
- NEVER reference age, gender, race, religion, disability, family status, accent, or appearance
- NEVER score "culture fit" or similar subjective traits
- Score ONLY observable conversation behavior with transcript evidence`;
}

/** @deprecated Use buildEvaluatorPrompt */
export const evaluatorPrompt = buildEvaluatorPrompt;

// ─── 5. Report builder ────────────────────────────────────────────────────────

export function buildReportBuilderPrompt(
  evaluationJson: string,
  userContext: string,
  meta?: { targetName?: string; conversationType?: string; sessionDate?: string }
): string {
  return `Expand this evaluation JSON into a rich, human-readable feedback report JSON for the Rehearsal app UI.

EVALUATION:
${evaluationJson}

USER CONTEXT VOCABULARY (reuse exact phrases in suggested_answers where relevant):
${userContext}

${meta?.targetName ? `Target name: ${meta.targetName}` : ""}
${meta?.conversationType ? `Conversation type: ${meta.conversationType}` : ""}
${meta?.sessionDate ? `Session date: ${meta.sessionDate}` : ""}

Output JSON matching the feedback report schema:
- executive_summary (target-specific, 2–4 sentences)
- best_moments, weak_moments, missed_signals, suggested_answers (formatted for display)
- communication_notes
- overall_score, target_fit_score, conversation_type, target_name, session_date

Be specific to the target. Never generic. No hire/no-hire language.`;
}

/** @deprecated Use buildReportBuilderPrompt */
export const reportBuilderPrompt = buildReportBuilderPrompt;

// ─── 7. Live session system prompt composition ──────────────────────────────

export interface AvatarSystemPromptParams {
  personaBlock: string;
  userContextBlock: string;
  conversationType: ConversationType;
  difficulty: number;
  goal: string;
  durationMinutes: number;
}

export function buildAvatarSystemPrompt(params: AvatarSystemPromptParams): string {
  const level = Math.min(5, Math.max(1, Math.round(params.difficulty))) as
    | 1
    | 2
    | 3
    | 4
    | 5;
  const typeBlock = AVATAR_PROMPTS[params.conversationType]({
    goal: params.goal,
    durationMinutes: params.durationMinutes,
  });

  return `${params.personaBlock}

USER CONTEXT (reference only — do not read aloud):
${params.userContextBlock}

SCENARIO:
Conversation type: ${params.conversationType}
Goal: ${params.goal}
Duration: ${params.durationMinutes} minutes — pace the conversation accordingly.

${AVATAR_BEHAVIOR_RULES}

${typeBlock}

${DIFFICULTY_MODIFIERS[level]}

${FORBIDDEN_TOPICS_BLOCK}`;
}

/** @deprecated Use buildAvatarSystemPrompt */
export const avatarSystemPrompt = buildAvatarSystemPrompt;
