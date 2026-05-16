import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { reportBelongsToOrg } from "@/lib/api/org";
import { createServiceSupabaseClient } from "@/lib/db";
import { RateAccuracySchema } from "@/lib/schemas";

type RouteContext = { params: { id: string } };

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const belongs = await reportBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Report not found", 404);

  const parsed = await parseJsonBody(request, RateAccuracySchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();

  const { data: report } = await supabase
    .from("feedback_reports")
    .select("session_id")
    .eq("id", params.id)
    .single();

  if (!report) return jsonError("Report not found", 404);

  const { data: session } = await supabase
    .from("sessions")
    .select("target_profile_id, user_id")
    .eq("id", report.session_id)
    .single();

  if (!session || session.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  const { data: rating, error } = await supabase
    .from("accuracy_ratings")
    .insert({
      session_id: report.session_id,
      target_profile_id: session.target_profile_id,
      user_id: auth.session.user.id,
      accuracy_score: parsed.data.accuracy_score,
      feedback_text: parsed.data.feedback_text ?? null,
    })
    .select()
    .single();

  if (error || !rating) {
    return jsonError(error?.message ?? "Failed to save rating", 500);
  }

  return jsonOk({ rating }, 201);
}
