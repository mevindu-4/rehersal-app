import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { reportBelongsToOrg } from "@/lib/api/org";
import { createServiceSupabaseClient } from "@/lib/db";
import { canManageTeam } from "@/lib/auth";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const belongs = await reportBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Report not found", 404);

  const supabase = createServiceSupabaseClient();
  const { data: report, error } = await supabase
    .from("feedback_reports")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !report) return jsonError("Report not found", 404);

  const { data: session } = await supabase
    .from("sessions")
    .select("user_id, scenario_id")
    .eq("id", report.session_id)
    .single();

  const isCoach = canManageTeam(auth.session.membership.role);
  if (!isCoach && session?.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  const [{ data: evaluation }, { data: coach_comments }, { data: turns }] =
    await Promise.all([
      supabase
        .from("evaluations")
        .select("overall_score, target_fit_score, confidence")
        .eq("session_id", report.session_id)
        .maybeSingle(),
      supabase
        .from("coach_comments")
        .select("*")
        .eq("report_id", params.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("session_turns")
        .select("*")
        .eq("session_id", report.session_id)
        .order("sequence", { ascending: true }),
    ]);

  return jsonOk({
    report,
    evaluation: evaluation ?? null,
    coach_comments: coach_comments ?? [],
    scenario_id: session?.scenario_id ?? null,
    turns: turns ?? [],
  });
}
