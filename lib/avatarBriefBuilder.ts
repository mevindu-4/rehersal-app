import { buildAvatarSystemPrompt as composeAvatarSystemPrompt } from "@/lib/prompts";
import type {
  ConversationType,
  PersonalityJSON,
  Scenario,
  TargetProfile,
} from "@/types";

export interface AvatarBriefInput {
  target: TargetProfile;
  scenario: Scenario;
  userContextBlock: string;
}

export function buildAvatarSystemPrompt(input: AvatarBriefInput): string {
  const personaBlock =
    input.target.avatar_brief_template ??
    "You are simulating the target person in a high-stakes conversation.";

  const personality = input.target.personality_json;
  const personaWithProfile = personality
    ? `${personaBlock}\n\nPERSONALITY PROFILE:\n${JSON.stringify(personality, null, 2)}`
    : personaBlock;

  return composeAvatarSystemPrompt({
    personaBlock: personaWithProfile,
    userContextBlock: input.userContextBlock,
    conversationType: input.scenario.conversation_type as ConversationType,
    difficulty: input.scenario.difficulty,
    goal: input.scenario.goal,
    durationMinutes: input.scenario.duration_minutes,
  });
}
