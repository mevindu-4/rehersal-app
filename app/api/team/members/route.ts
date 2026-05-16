import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

/** List org members with user profile — coach/owner only (team mode). */
export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  if (auth.session.organization.mode !== "team") {
    return jsonError("Team members API requires team mode", 400);
  }

  const supabase = createServiceSupabaseClient();
  const { data: memberships, error: memError } = await supabase
    .from("memberships")
    .select("id, role, created_at, user_id")
    .eq("org_id", auth.session.organization.id)
    .order("created_at", { ascending: true });

  if (memError) return jsonError(memError.message, 500);

  const userIds = (memberships ?? []).map((m) => m.user_id);
  if (userIds.length === 0) {
    return jsonOk({ members: [] });
  }

  const { data: users, error: userError } = await supabase
    .from("users")
    .select("id, email, name, avatar_url")
    .in("id", userIds);

  if (userError) return jsonError(userError.message, 500);

  const userMap = new Map((users ?? []).map((u) => [u.id, u]));

  const members = (memberships ?? []).map((m) => ({
    membership_id: m.id,
    role: m.role,
    joined_at: m.created_at,
    user: userMap.get(m.user_id) ?? {
      id: m.user_id,
      email: null,
      name: null,
      avatar_url: null,
    },
  }));

  return jsonOk({ members });
}
