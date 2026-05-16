import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { canManageTeam } from "@/lib/auth";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = createServiceSupabaseClient();
  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (error || !session) return jsonError("Session not found", 404);

  const isCoach = canManageTeam(auth.session.membership.role);
  if (!isCoach && session.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  const [{ data: scenario }, { data: target }, { data: turns }, { data: report }] =
    await Promise.all([
      supabase.from("scenarios").select("*").eq("id", session.scenario_id).single(),
      supabase
        .from("target_profiles")
        .select("*")
        .eq("id", session.target_profile_id)
        .single(),
      supabase
        .from("session_turns")
        .select("*")
        .eq("session_id", params.id)
        .order("sequence", { ascending: true }),
      session.status === "report_ready"
        ? supabase
            .from("feedback_reports")
            .select("id")
            .eq("session_id", params.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const { system_prompt_used, ...safeSession } = session;

  return jsonOk({
    session: safeSession,
    scenario,
    target,
    turns: turns ?? [],
    report_id: report?.id ?? null,
  });
}
