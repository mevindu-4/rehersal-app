"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useTeamReport } from "@/lib/hooks/use-team-report";

export function TeamPulseBand() {
  const { data, isLoading } = useTeamReport();

  if (isLoading) return <LoadingSkeleton rows={1} />;

  const members = data?.members ?? [];
  const mostActive = [...members].sort(
    (a, b) => b.sessions_count - a.sessions_count
  )[0];
  const needsAttention = members.filter(
    (m) => m.sessions_count === 0 || (m.avg_score > 0 && m.avg_score < 50)
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <p className="text-caption text-foreground-tertiary">Most active</p>
        <p className="mt-2 font-display text-h3">
          {mostActive?.name ?? "—"}
        </p>
      </Card>
      <Card className="p-4">
        <p className="text-caption text-foreground-tertiary">Needs attention</p>
        <p className="mt-2 font-display text-h1 text-critical">{needsAttention}</p>
        <Link href="/admin" className="mt-2 text-small text-accent hover:underline">
          View admin
        </Link>
      </Card>
    </div>
  );
}
