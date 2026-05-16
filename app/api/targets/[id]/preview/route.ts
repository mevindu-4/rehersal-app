import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getTargetForOrg } from "@/lib/api/targets";
import { avatarSystemPrompt } from "@/lib/prompts";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const target = await getTargetForOrg(params.id, auth.session.organization.id);
  if (!target) return jsonError("Target not found", 404);

  const avatar_brief =
    target.avatar_brief_template ??
    "Complete target reconstruction to generate an avatar brief preview.";

  const system_prompt_preview =
    target.personality_json && target.status === "complete"
      ? avatarSystemPrompt({
          personaBlock: avatar_brief,
          userContextBlock: "(User documents loaded at session start)",
          conversationType: "job_interview",
          difficulty: 3,
          goal: "Practice conversation with this target",
          durationMinutes: 15,
        })
      : "System prompt available after reconstruction completes.";

  return jsonOk({ avatar_brief, system_prompt_preview });
}
