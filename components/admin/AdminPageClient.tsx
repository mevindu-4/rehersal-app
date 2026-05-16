"use client";

import { Card } from "@/components/ui/card";
import { TeamPulseBand } from "@/components/admin/TeamPulseBand";
import { TeamMemberTable } from "@/components/admin/TeamMemberTable";
import { SkillGapChart } from "@/components/admin/SkillGapChart";
import { useTeamReport } from "@/lib/hooks/use-team-report";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export function AdminPageClient() {
  const { data, isLoading } = useTeamReport();

  return (
    <div className="mx-auto max-w-app space-y-10 p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">Admin</h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Team activity, skill gaps, and member performance.
        </p>
      </div>

      <TeamPulseBand />

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <p className="text-caption text-foreground-tertiary">Team members</p>
            <p className="mt-2 font-display text-h1">{data?.members.length ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-caption text-foreground-tertiary">Sessions this week</p>
            <p className="mt-2 font-display text-h1">{data?.sessions_this_week ?? 0}</p>
          </Card>
          <Card className="p-4">
            <p className="text-caption text-foreground-tertiary">Avg team score</p>
            <p className="mt-2 font-display text-h1 text-accent">
              {data?.avg_team_score ?? 0}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-caption text-foreground-tertiary">Active this week</p>
            <p className="mt-2 font-display text-h1">
              {data?.members.filter((m) => m.sessions_count > 0).length ?? 0}
            </p>
          </Card>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-h2 text-foreground-primary">Members</h2>
        <TeamMemberTable />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-h2 text-foreground-primary">Skill gaps</h2>
        <SkillGapChart />
      </section>
    </div>
  );
}
