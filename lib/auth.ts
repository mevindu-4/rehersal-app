import { redirect } from "next/navigation";
import { getApiContext } from "@/lib/api-auth";
import { isAuthDisabled } from "@/lib/auth-config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MembershipRole } from "@/types";

export type MembershipRow = {
  id: string;
  user_id: string;
  org_id: string;
  role: MembershipRole;
  created_at: string;
};

export async function getSession() {
  if (isAuthDisabled()) {
    const ctx = await getApiContext();
    if (!ctx) return null;
    return { id: ctx.userId, email: ctx.email };
  }
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireAuth(redirectTo = "/login") {
  if (isAuthDisabled()) {
    const ctx = await getApiContext();
    if (!ctx) redirect(redirectTo);
    return { id: ctx.userId, email: ctx.email };
  }
  const user = await getSession();
  if (!user) redirect(redirectTo);
  return user;
}

export async function getMembership(orgId?: string) {
  const supabase = await createServerSupabaseClient();
  const user = await requireAuth();

  let query = supabase
    .from("memberships")
    .select("*, organizations(*)")
    .eq("user_id", user.id);

  if (orgId) query = query.eq("org_id", orgId);

  const { data } = await query.limit(1).maybeSingle();
  return data as MembershipRow | null;
}

export async function requireRole(roles: MembershipRole[]) {
  const membership = await getMembership();
  if (!membership || !roles.includes(membership.role)) {
    redirect("/dashboard");
  }
  return membership;
}

export function isCoachOrOwner(role: string) {
  return role === "coach" || role === "owner";
}
