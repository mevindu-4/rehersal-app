"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ScenarioStartButton } from "@/components/scenarios/ScenarioStartButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useScenario, useTarget } from "@/lib/hooks/use-api";
import { CONVERSATION_TYPES, DIFFICULTY_LABELS } from "@/lib/constants";

export default function ScenarioDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useScenario(id);
  const scenario = data?.scenario;
  const { data: targetData } = useTarget(scenario?.target_profile_id ?? "", {});

  if (isLoading) {
    return (
      <div className="mx-auto max-w-app p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (!scenario) {
    return (
      <div className="mx-auto max-w-app p-8">
        <p className="text-critical">Scenario not found.</p>
      </div>
    );
  }

  const typeLabel =
    CONVERSATION_TYPES.find((c) => c.id === scenario.conversation_type)?.label ??
    scenario.conversation_type;

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="font-mono text-caption uppercase">
            {typeLabel}
          </Badge>
          <h1 className="mt-2 font-display text-display-2 text-foreground-primary">
            {scenario.title}
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            {targetData?.target?.name ?? "Target"} · {scenario.duration_minutes} min ·{" "}
            {DIFFICULTY_LABELS[scenario.difficulty - 1]}
          </p>
        </div>
        <ScenarioStartButton scenarioId={id} />
      </div>

      <section className="space-y-2">
        <h2 className="font-mono text-caption uppercase text-foreground-tertiary">
          Session goal
        </h2>
        <p className="max-w-2xl text-body text-foreground-primary">{scenario.goal}</p>
      </section>

      <div className="flex gap-3">
        <Button variant="ghost" asChild>
          <Link href="/scenarios">Back to scenarios</Link>
        </Button>
      </div>
    </div>
  );
}
