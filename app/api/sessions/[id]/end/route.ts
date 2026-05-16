import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { evaluateSession } from "@/lib/evaluator";
import { syncSessionTurns } from "@/lib/sessionTurns";

type RouteContext = { params: { id: string } };

export async function POST(_request: Request, { params }: RouteContext) {
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
  if (session.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  const endedAt = new Date();
  const startedAt = session.started_at
    ? new Date(session.started_at)
    : endedAt;
  const duration_seconds = Math.max(
    0,
    Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
  );

  await supabase
    .from("sessions")
    .update({
      ended_at: endedAt.toISOString(),
      duration_seconds,
      status: "ended",
    })
    .eq("id", params.id);

  try {
    if (session.bey_call_id) {
      await syncSessionTurns(params.id);
    }
  } catch {
    /* continue — evaluation may still run with partial transcript */
  }

  await supabase
    .from("sessions")
    .update({ status: "evaluating" })
    .eq("id", params.id);

  void evaluateSession(params.id);

  return jsonOk(
    { session_id: params.id, status: "evaluating" as const },
    202
  );
}
