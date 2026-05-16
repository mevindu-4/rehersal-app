import { DEV_USER_EMAIL, isAuthDisabled } from "@/lib/auth-config";
import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase/server";
import type { MembershipRole } from "@/types";

export type ApiContext = {
  userId: string;
  email: string;
  orgId: string;
  role: MembershipRole;
};

async function getOrCreateDevApiContext(): Promise<ApiContext> {
  const service = createServiceClient();
  const email = DEV_USER_EMAIL;

  const { data: existingUser } = await service
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  let userId = existingUser?.id as string | undefined;

  if (!userId) {
    const { data: created, error } = await service.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: "Dev User" },
    });

    if (created?.user) {
      userId = created.user.id;
    } else if (error) {
      const { data: listed } = await service.auth.admin.listUsers({ perPage: 200 });
      userId = listed?.users?.find((u) => u.email === email)?.id;
      if (!userId) throw new Error(`Dev user setup failed: ${error.message}`);
    }
  }

  await bootstrapUser(userId!, email, "Dev User");

  const { data: membership } = await service
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", userId!)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    throw new Error("Dev workspace membership missing after bootstrap");
  }

  return {
    userId: userId!,
    email,
    orgId: membership.org_id as string,
    role: membership.role as MembershipRole,
  };
}

export async function getApiContext(): Promise<ApiContext | null> {
  if (isAuthDisabled()) {
    try {
      return await getOrCreateDevApiContext();
    } catch (e) {
      console.error("[dev auth]", e);
      return null;
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const service = createServiceClient();
  const { data: membership } = await service
    .from("memberships")
    .select("org_id, role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) {
    await bootstrapUser(user.id, user.email, user.user_metadata?.full_name as string | undefined);
    const { data: retry } = await service
      .from("memberships")
      .select("org_id, role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (!retry) return null;
    return {
      userId: user.id,
      email: user.email,
      orgId: retry.org_id as string,
      role: retry.role as MembershipRole,
    };
  }

  return {
    userId: user.id,
    email: user.email,
    orgId: membership.org_id as string,
    role: membership.role as MembershipRole,
  };
}

export async function bootstrapUser(
  userId: string,
  email: string,
  name?: string
) {
  const service = createServiceClient();

  await service.from("users").upsert({
    id: userId,
    email,
    name: name ?? email.split("@")[0],
    updated_at: new Date().toISOString(),
  });

  const slug = `workspace-${userId.slice(0, 8)}`;
  const { data: existingOrg } = await service
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  let orgId = existingOrg?.id as string | undefined;
  if (!orgId) {
    const { data: org } = await service
      .from("organizations")
      .insert({ name: "My Workspace", slug })
      .select("id")
      .single();
    orgId = org?.id as string;
  }

  if (orgId) {
    await service.from("memberships").upsert(
      { user_id: userId, org_id: orgId, role: "owner" },
      { onConflict: "user_id,org_id" }
    );
  }
}
