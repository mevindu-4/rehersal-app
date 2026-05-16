import { AppShell } from "@/components/shared/AppShell";
import { Sidebar } from "@/components/shared/Sidebar";
import { getApiContext } from "@/lib/api-auth";
import { isAuthDisabled } from "@/lib/auth-config";
import { isCoachOrOwner } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let showAdmin = false;
  let userName: string | null = null;
  let userEmail: string | null = null;
  const authDisabled = isAuthDisabled();

  if (authDisabled) {
    const ctx = await getApiContext();
    userName = "Dev User";
    userEmail = ctx?.email ?? null;
    showAdmin = ctx ? isCoachOrOwner(ctx.role) : true;
  } else {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email ?? null;
      userName =
        (user.user_metadata?.full_name as string) ??
        user.email?.split("@")[0] ??
        null;

      const { data: membership } = await supabase
        .from("memberships")
        .select("role")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      const role = (membership as { role: string } | null)?.role;
      if (role) {
        showAdmin = isCoachOrOwner(role);
      }
    }
  }

  return (
    <AppShell>
      <div className="flex min-h-screen">
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          showAdmin={showAdmin}
          authDisabled={authDisabled}
        />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </AppShell>
  );
}
