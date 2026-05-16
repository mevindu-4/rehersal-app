"use client";

import Link from "next/link";
import { ArrowRight, FileText, Plus, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TeamPulseBand } from "@/components/admin/TeamPulseBand";
import { TargetCard } from "@/components/targets/TargetCard";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import { useScenarios, useSessions, useTargets } from "@/lib/hooks/use-api";
import { CONVERSATION_TYPES } from "@/lib/constants";
import { WeekHeatmap } from "@/components/dashboard/WeekHeatmap";
import { StreakTracker } from "@/components/progress/StreakTracker";
import {
  computeStreak,
  formatDate,
  getGreeting,
  scoreDescriptor,
  weekSessionCounts,
} from "@/lib/utils";
export function DashboardContent({
  userName,
  isCoach,
  isTeam,
}: {
  userName: string;
  isCoach: boolean;
  isTeam: boolean;
}) {

  const { data: targetsData, isLoading: targetsLoading } = useTargets({
    status: "complete",
  });
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({
    limit: 8,
  });
  const { data: scenariosData } = useScenarios();

  const targets = targetsData?.targets ?? [];
  const sessions = sessionsData?.sessions ?? [];
  const scenarios = scenariosData?.scenarios ?? [];
  const isNewUser = sessions.length === 0 && targets.length === 0;

  const weekSessions = sessions.filter((s) => {
    const d = new Date(s.session.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  });

  const withEval = weekSessions.filter((s) => s.evaluation);
  const avgScore =
    withEval.length > 0
      ? Math.round(
          withEval.reduce((a, s) => a + s.evaluation!.overall_score, 0) /
            withEval.length
        )
      : null;

  if (isNewUser) {
    return (
      <div className="mx-auto max-w-app space-y-10 p-8 animate-fade-in-up">
        <div>
          <h1 className="font-display text-display-2 text-foreground-primary">
            Welcome, {userName}.
          </h1>
          <p className="mt-2 text-body-lg text-foreground-secondary">
            Your first rehearsal is three steps away
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { step: "1", title: "Pick a target", href: "/library" },
            { step: "2", title: "Add context", href: "/documents" },
            { step: "3", title: "Run a rehearsal", href: "/scenarios/new" },
          ].map((item) => (
            <Card key={item.step} className="border border-border p-6">
              <span className="font-mono text-caption text-accent">
                Step {item.step}
              </span>
              <p className="mt-2 font-display text-h3">{item.title}</p>
              <Button variant="ghost" size="sm" className="mt-4" asChild>
                <Link href={item.href}>Get started</Link>
              </Button>
            </Card>
          ))}
        </div>
        <p className="text-small text-foreground-secondary">
          Or try a demo with{" "}
          <Link
            href="/library/lib_contrarian_seed_vc"
            className="text-accent hover:underline"
          >
            The Contrarian Seed VC
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-app space-y-10 p-8 animate-fade-in-up">
      {isTeam && isCoach && <TeamPulseBand />}

      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">
          {getGreeting()}, {userName}
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          {weekSessions.length} rehearsal{weekSessions.length === 1 ? "" : "s"} this week
          {avgScore != null &&
            ` — avg score ${avgScore} (${scoreDescriptor(avgScore).toLowerCase()})`}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Button asChild className="h-auto flex-col items-start gap-2 p-6">
          <Link href="/scenarios/new">
            <Zap className="h-5 w-5" strokeWidth={1.5} />
            <span className="font-display text-h3">Start a rehearsal</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-6">
          <Link href="/targets/new">
            <Target className="h-5 w-5" strokeWidth={1.5} />
            <span className="font-display text-h3">Build a new target</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto flex-col items-start gap-2 p-6">
          <Link href="/documents">
            <FileText className="h-5 w-5" strokeWidth={1.5} />
            <span className="font-display text-h3">Add context</span>
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="font-display text-h2 text-foreground-primary">
          Continue where you left off
        </h2>
        {sessionsLoading ? (
          <LoadingSkeleton rows={2} className="mt-4" />
        ) : sessions.length === 0 ? (
          <p className="mt-4 text-small text-foreground-secondary">No recent sessions.</p>
        ) : (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {sessions.slice(0, 6).map(({ session: s, scenario, target, evaluation }) => {
              const typeLabel =
                CONVERSATION_TYPES.find((c) => c.id === scenario?.conversation_type)
                  ?.label ?? "Session";
              return (
                <Card
                  key={s.id}
                  className="min-w-[240px] shrink-0 border border-border p-4"
                >
                  <p className="font-display text-h3">{target?.name ?? "Rehearsal"}</p>
                  <p className="text-small text-foreground-secondary">{typeLabel}</p>
                  <p className="mt-1 font-mono text-caption text-foreground-tertiary">
                    {formatDate(s.created_at)}
                  </p>
                  {evaluation && (
                    <p className="mt-2 font-display text-h2 text-accent">
                      {evaluation.overall_score}
                    </p>
                  )}
                  <Button variant="ghost" size="sm" className="mt-3" asChild>
                    <Link href={`/sessions/${s.id}`}>
                      Open <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-h2 text-foreground-primary">Your targets</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/targets">
              View all <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
        {targetsLoading ? (
          <LoadingSkeleton rows={3} className="mt-4" />
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {targets.slice(0, 6).map((t) => (
              <TargetCard key={t.id} target={t} />
            ))}
          </div>
        )}
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/targets/new">
            <Plus className="mr-2 h-4 w-4" /> New target
          </Link>
        </Button>
      </section>

      {scenarios.length > 0 && (
        <section>
          <h2 className="font-display text-h2 text-foreground-primary">Up next</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.slice(0, 3).map((sc) => (
              <ScenarioCard
                key={sc.id}
                scenario={sc}
                target={targets.find((t) => t.id === sc.target_profile_id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-h2 text-foreground-primary">This week</h2>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end">
          <Card className="flex-1 border border-border p-6">
            <WeekHeatmap
              counts={weekSessionCounts(
                sessions.map((s) => s.session.created_at)
              )}
            />
          </Card>
          <div className="w-full sm:w-48">
            <StreakTracker
              streak={computeStreak(sessions.map((s) => s.session.created_at))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
