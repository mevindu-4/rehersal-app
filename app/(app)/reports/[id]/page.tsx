import { requireSession, canManageTeam } from "@/lib/auth";
import { ReportPageClient } from "@/components/reports/ReportPageClient";

export default async function ReportPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireSession();
  const showCoachTools = canManageTeam(session.membership.role);

  return (
    <ReportPageClient reportId={params.id} showCoachTools={showCoachTools} />
  );
}
