import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { accuracyRatingSchema } from "@/lib/schemas";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const body = await request.json();
  const parsed = accuracyRatingSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const supabase = createServiceClient();
  const { data: report } = await supabase
    .from("feedback_reports")
    .select("session_id, sessions!inner(target_profile_id, user_id)")
    .eq("id", params.id)
    .single();

  if (!report) return jsonError("Report not found", 404);
  const rawSession = report.sessions as unknown;
  const session = (Array.isArray(rawSession) ? rawSession[0] : rawSession) as {
    target_profile_id: string;
    user_id: string;
  };
  if (session.user_id !== ctx.userId) return unauthorized();

  await supabase.from("accuracy_ratings").insert({
    session_id: report.session_id,
    target_profile_id: session.target_profile_id,
    user_id: ctx.userId,
    accuracy_score: parsed.data.accuracy_score,
    feedback_text: parsed.data.feedback_text ?? null,
  });

  return jsonOk({ success: true });
}
