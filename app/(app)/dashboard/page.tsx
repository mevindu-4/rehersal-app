import { requireSession, canManageTeam } from "@/lib/auth";
import { DashboardContent } from "@/components/DashboardContent";

export default async function DashboardPage() {
  const session = await requireSession();
  const name = session.user.name?.split(" ")[0] ?? "there";

  return (
    <DashboardContent
      userName={name}
      isCoach={canManageTeam(session.membership.role)}
      isTeam={session.organization.mode === "team"}
    />
  );
}
