import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import type { SessionHistoryItem } from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const learnerId = searchParams.get("learner_id");

  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("sessions")
    .select(
      "*, scenarios(*), target_profiles(*), evaluations(overall_score, target_fit_score)"
    )
    .eq("org_id", auth.session.organization.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (from) query = query.gte("created_at", from);
  if (learnerId) query = query.eq("user_id", learnerId);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  const sessions: SessionHistoryItem[] = (data ?? []).map((row) => {
    const { scenarios, target_profiles, evaluations, ...session } = row as Record<
      string,
      unknown
    >;
    const evalRow = Array.isArray(evaluations)
      ? evaluations[0]
      : evaluations;
    return {
      session: session as unknown as SessionHistoryItem["session"],
      scenario: scenarios as SessionHistoryItem["scenario"],
      target: target_profiles as SessionHistoryItem["target"],
      evaluation: evalRow as SessionHistoryItem["evaluation"],
    };
  });

  return jsonOk({ sessions });
}
