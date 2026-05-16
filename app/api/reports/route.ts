import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("feedback_reports")
    .select(
      "id, created_at, viewed_at, report_json, sessions!inner(id, user_id, created_at, target_profiles(name), scenarios(title, conversation_type), evaluations(overall_score, target_fit_score))"
    )
    .eq("sessions.user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);

  const reports = (data ?? []).map((row) => {
    const session = row.sessions as {
      id: string;
      created_at: string;
      target_profiles?: { name: string };
      scenarios?: { title: string; conversation_type: string };
      evaluations?: Array<{ overall_score: number; target_fit_score: number }>;
    };
    const reportJson = row.report_json as { target_name?: string; conversation_type?: string };
    return {
      id: row.id,
      created_at: row.created_at,
      viewed_at: row.viewed_at,
      session_id: session.id,
      target_name:
        reportJson.target_name ?? session.target_profiles?.name ?? "Target",
      scenario_title: session.scenarios?.title ?? "Rehearsal",
      conversation_type:
        reportJson.conversation_type ?? session.scenarios?.conversation_type,
      overall_score: session.evaluations?.[0]?.overall_score ?? null,
      target_fit_score: session.evaluations?.[0]?.target_fit_score ?? null,
    };
  });

  return jsonOk(reports);
}
