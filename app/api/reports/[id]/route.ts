import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data: report, error } = await supabase
    .from("feedback_reports")
    .select("*, sessions!inner(user_id, target_profile_id, scenario_id)")
    .eq("id", params.id)
    .single();

  if (error || !report) return jsonError("Report not found", 404);

  const session = report.sessions as unknown as { user_id: string };
  if (session.user_id !== ctx.userId) return unauthorized();

  await supabase
    .from("feedback_reports")
    .update({ viewed_at: new Date().toISOString() })
    .eq("id", params.id);

  return jsonOk(report.report_json);
}
