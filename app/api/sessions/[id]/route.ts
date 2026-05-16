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
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "*, scenarios(*), target_profiles(name, title, personality_json)"
    )
    .eq("id", params.id)
    .eq("user_id", ctx.userId)
    .single();

  if (error) return jsonError("Session not found", 404);

  const { data: report } = await supabase
    .from("feedback_reports")
    .select("id")
    .eq("session_id", params.id)
    .maybeSingle();

  return jsonOk({ ...data, reportId: report?.id ?? null });
}
