import { requireSession, canManageTeam, isTeamMode } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AssignmentsPageClient } from "@/components/admin/AssignmentsPageClient";

export default async function AssignmentsPage() {
  const session = await requireSession();

  if (!isTeamMode(session.organization)) {
    redirect("/dashboard");
  }

  return (
    <AssignmentsPageClient isCoach={canManageTeam(session.membership.role)} />
  );
}


