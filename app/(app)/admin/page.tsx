import { redirect } from "next/navigation";
import { requireSession, isTeamMode, canManageTeam } from "@/lib/auth";
import { TeamMemberTable } from "@/components/admin/TeamMemberTable";
import { SkillGapChart } from "@/components/admin/SkillGapChart";
import { TeamPulseBand } from "@/components/admin/TeamPulseBand";

export default async function AdminPage() {
  const session = await requireSession();

  if (!isTeamMode(session.organization) || !canManageTeam(session.membership.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-app space-y-10 p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">Admin</h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Team activity, skill gaps, and member performance.
        </p>
      </div>
      <TeamPulseBand />
      <section>
        <h2 className="font-display text-h2 text-foreground-primary">Team members</h2>
        <div className="mt-4">
          <TeamMemberTable />
        </div>
      </section>
      <section>
        <h2 className="font-display text-h2 text-foreground-primary">Skill gaps</h2>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <SkillGapChart />
        </div>
      </section>
    </div>
  );
}

