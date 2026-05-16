"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CONVERSATION_TYPES, DIFFICULTY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Scenario, TargetProfile } from "@/types";

export function ScenarioCard({
  scenario,
  target,
}: {
  scenario: Scenario;
  target?: TargetProfile;
}) {
  const typeLabel =
    CONVERSATION_TYPES.find((c) => c.id === scenario.conversation_type)?.label ??
    scenario.conversation_type;

  return (
    <Card className="flex flex-col border border-border p-4 transition-colors hover:border-border-default">
      <Badge variant="outline" className="w-fit font-mono text-caption uppercase">
        {typeLabel}
      </Badge>
      <h2 className="mt-2 font-display text-h2 text-foreground-primary">
        {scenario.title}
      </h2>
      <p className="text-small text-foreground-secondary">
        {target?.name ?? "Target"} · {scenario.duration_minutes} min ·{" "}
        {DIFFICULTY_LABELS[scenario.difficulty - 1]}
      </p>
      <p className="mt-2 line-clamp-2 text-small text-foreground-tertiary">
        {scenario.goal}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-caption text-foreground-tertiary">
          {formatDate(scenario.updated_at)}
        </span>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/scenarios/${scenario.id}`}>
            Open <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
