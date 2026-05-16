import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const supabase = createServiceSupabaseClient();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, user_id, created_at, evaluations(overall_score, rubric_scores_json)")
    .eq("org_id", auth.session.organization.id)
    .gte("created_at", weekAgo.toISOString());

  const sessionList = sessions ?? [];
  const scores = sessionList
    .map((s) => {
      const ev = Array.isArray(s.evaluations) ? s.evaluations[0] : s.evaluations;
      return ev?.overall_score as number | undefined;
    })
    .filter((n): n is number => typeof n === "number");

  const avg_team_score =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const dimensionMap = new Map<string, number[]>();
  for (const s of sessionList) {
    const ev = Array.isArray(s.evaluations) ? s.evaluations[0] : s.evaluations;
    const rubric = (ev?.rubric_scores_json ?? []) as {
      dimension: string;
      score: number;
    }[];
    for (const r of rubric) {
      const list = dimensionMap.get(r.dimension) ?? [];
      list.push(r.score);
      dimensionMap.set(r.dimension, list);
    }
  }

  const skill_gaps = Array.from(dimensionMap.entries()).map(([dimension, vals]) => ({
    dimension,
    avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }));

  const { data: memberships } = await supabase
    .from("memberships")
    .select("user_id, users(id, name, email)")
    .eq("org_id", auth.session.organization.id);

  const members = await Promise.all(
    (memberships ?? []).map(async (m) => {
      const user = m.users as unknown as {
        id: string;
        name: string | null;
        email: string;
      };
      const userSessions = sessionList.filter((s) => s.user_id === m.user_id);
      const userScores = userSessions
        .map((s) => {
          const ev = Array.isArray(s.evaluations)
            ? s.evaluations[0]
            : s.evaluations;
          return ev?.overall_score as number | undefined;
        })
        .filter((n): n is number => typeof n === "number");

      const last = userSessions[0]?.created_at ?? null;

      return {
        user_id: m.user_id,
        name: user?.name ?? user?.email ?? "Member",
        sessions_count: userSessions.length,
        avg_score:
          userScores.length > 0
            ? Math.round(userScores.reduce((a, b) => a + b, 0) / userScores.length)
            : 0,
        last_active: last,
      };
    })
  );

  return jsonOk({
    sessions_this_week: sessionList.length,
    avg_team_score,
    skill_gaps,
    members,
  });
}
