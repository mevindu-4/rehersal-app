"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ImprovementChart } from "@/components/progress/ImprovementChart";
import { SkillRadar } from "@/components/progress/SkillRadar";
import { SessionHistoryList } from "@/components/progress/SessionHistoryList";
import { StreakTracker } from "@/components/progress/StreakTracker";
import { useAdminSessions, useSessions } from "@/lib/hooks/use-api";
import { computeStreak } from "@/lib/utils";
import type { RubricScore, SessionHistoryItem } from "@/types";

function ProgressStats({ sessions }: { sessions: SessionHistoryItem[] }) {
  const withEval = sessions.filter((s) => s.evaluation);
  const avgOverall =
    withEval.length > 0
      ? Math.round(
          withEval.reduce((a, s) => a + s.evaluation!.overall_score, 0) /
            withEval.length
        )
      : 0;
  const avgFit =
    withEval.length > 0
      ? Math.round(
          withEval.reduce((a, s) => a + s.evaluation!.target_fit_score, 0) /
            withEval.length
        )
      : 0;

  const allRubric: RubricScore[] = [];
  for (const s of withEval) {
    const rubric = (s.evaluation as { rubric_scores_json?: RubricScore[] })
      ?.rubric_scores_json;
    if (rubric) allRubric.push(...rubric);
  }

  const streak = computeStreak(sessions.map((s) => s.session.created_at));

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-caption text-foreground-tertiary">Total sessions</p>
          <p className="mt-2 font-display text-h1">{sessions.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-caption text-foreground-tertiary">Avg overall</p>
          <p className="mt-2 font-display text-h1 text-accent">{avgOverall}</p>
        </Card>
        <Card className="p-4">
          <p className="text-caption text-foreground-tertiary">Avg target fit</p>
          <p className="mt-2 font-display text-h1 text-success">{avgFit}</p>
        </Card>
        <StreakTracker streak={streak} />
      </div>

      <section>
        <h2 className="font-display text-h2 text-foreground-primary">
          Improvement over time
        </h2>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <ImprovementChart sessions={sessions} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-h2 text-foreground-primary">Skill radar</h2>
        <div className="mt-4 rounded-lg border border-border bg-surface p-4">
          <SkillRadar scores={allRubric} />
        </div>
      </section>

      <section>
        <h2 className="font-display text-h2 text-foreground-primary">
          Session history
        </h2>
        <div className="mt-4">
          <SessionHistoryList sessions={sessions} />
        </div>
      </section>
    </>
  );
}

export function ProgressDashboard({
  isTeam = false,
  isCoach = false,
}: {
  isTeam?: boolean;
  isCoach?: boolean;
}) {
  const [tab, setTab] = useState<"mine" | "team">("mine");
  const { data: myData, isLoading: myLoading } = useSessions({ limit: 50 });
  const { data: teamData, isLoading: teamLoading } = useAdminSessions(
    isTeam && isCoach && tab === "team"
  );

  const showTeamTab = isTeam && isCoach;
  const isLoading = tab === "team" ? teamLoading : myLoading;
  const sessions =
    tab === "team" && showTeamTab
      ? (teamData?.sessions ?? [])
      : (myData?.sessions ?? []);

  if (isLoading) return <LoadingSkeleton rows={6} />;

  const content = <ProgressStats sessions={sessions} />;

  if (!showTeamTab) {
    return <div className="space-y-10 animate-fade-in-up">{content}</div>;
  }

  return (
    <Tabs
      value={tab}
      onValueChange={(v) => setTab(v as "mine" | "team")}
      className="space-y-8 animate-fade-in-up"
    >
      <TabsList>
        <TabsTrigger value="mine">My progress</TabsTrigger>
        <TabsTrigger value="team">Team progress</TabsTrigger>
      </TabsList>
      <TabsContent value="mine">{content}</TabsContent>
      <TabsContent value="team">{content}</TabsContent>
    </Tabs>
  );
}
