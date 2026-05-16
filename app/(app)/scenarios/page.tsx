"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ScenarioCard } from "@/components/scenarios/ScenarioCard";
import { useScenarios, useTargets } from "@/lib/hooks/use-api";

export default function ScenariosPage() {
  const { data, isLoading } = useScenarios();
  const { data: targetsData } = useTargets({ status: "complete" });

  const scenarios = data?.scenarios ?? [];
  const targets = targetsData?.targets ?? [];

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-2 text-foreground-primary">
            Scenarios
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            Rehearsal setups — conversation type, target, duration, and goals.
          </p>
        </div>
        <Button asChild>
          <Link href="/scenarios/new">
            <Plus className="mr-2 h-4 w-4" /> New scenario
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : scenarios.length === 0 ? (
        <EmptyState
          title="No scenarios yet"
          description="Configure a rehearsal with a target, conversation type, and session goal."
          actionLabel="Create scenario"
          actionHref="/scenarios/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((sc) => (
            <ScenarioCard
              key={sc.id}
              scenario={sc}
              target={targets.find((t) => t.id === sc.target_profile_id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
