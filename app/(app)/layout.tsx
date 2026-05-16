import { AppShell } from "@/components/shared/AppShell";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { requireSession } from "@/lib/auth";
import { createServiceSupabaseClient } from "@/lib/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  let pendingAssignments = 0;
  if (session.organization.mode === "team") {
    const supabase = createServiceSupabaseClient();
    const { count } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("org_id", session.organization.id)
      .eq("learner_id", session.user.id)
      .eq("status", "pending");
    pendingAssignments = count ?? 0;
  }

  return (
    <AppShell session={session} pendingAssignments={pendingAssignments}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </AppShell>
  );
}
