import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { CoachCommentSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const parsed = await parseJsonBody(request, CoachCommentSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();

  const { data: report } = await supabase
    .from("feedback_reports")
    .select("session_id")
    .eq("id", parsed.data.report_id)
    .single();

  if (!report) return jsonError("Report not found", 404);

  const { data: session } = await supabase
    .from("sessions")
    .select("org_id")
    .eq("id", report.session_id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (!session) return jsonError("Session not found", 404);

  const { data: comment, error } = await supabase
    .from("coach_comments")
    .insert({
      report_id: parsed.data.report_id,
      session_id: parsed.data.session_id,
      coach_id: auth.session.user.id,
      turn_sequence: parsed.data.turn_sequence ?? null,
      comment_text: parsed.data.comment_text,
    })
    .select()
    .single();

  if (error || !comment) {
    return jsonError(error?.message ?? "Failed to save comment", 500);
  }

  return jsonOk({ comment }, 201);
}
