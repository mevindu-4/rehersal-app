import { requireSession, canManageTeam, isTeamMode } from "@/lib/auth";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export default async function ProgressPage() {
  const session = await requireSession();
  const team = isTeamMode(session.organization);
  const coach = canManageTeam(session.membership.role);

  return (
    <div className="mx-auto max-w-app space-y-8 p-4 sm:p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">Progress</h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Track improvement across rehearsals, skills, and streaks.
        </p>
      </div>
      <ProgressDashboard isTeam={team} isCoach={coach} />
    </div>
  );
}
