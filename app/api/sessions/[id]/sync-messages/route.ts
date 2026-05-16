import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { syncSessionTurns } from "@/lib/sessionTurns";

type RouteContext = { params: { id: string } };

export async function POST(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const supabase = createServiceSupabaseClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id, user_id, org_id")
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id)
    .single();

  if (!session) return jsonError("Session not found", 404);
  if (session.user_id !== auth.session.user.id) {
    return jsonError("Forbidden", 403);
  }

  try {
    const turns_count = await syncSessionTurns(params.id);
    return jsonOk({ turns_count });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Failed to sync messages",
      500
    );
  }
}
