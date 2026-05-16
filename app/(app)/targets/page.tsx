"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { TargetCard } from "@/components/targets/TargetCard";
import { useTargets } from "@/lib/hooks/use-api";

export default function TargetsPage() {
  const { data, isLoading } = useTargets();

  const targets = data?.targets ?? [];

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-2 text-foreground-primary">Targets</h1>
          <p className="mt-2 text-body text-foreground-secondary">
            People you rehearse with — investors, interviewers, prospects, and more.
          </p>
        </div>
        <Button asChild>
          <Link href="/targets/new">
            <Plus className="mr-2 h-4 w-4" /> New target
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : targets.length === 0 ? (
        <EmptyState
          title="No targets yet"
          description="Build a personality profile from LinkedIn, documents, or your own notes."
          actionLabel="Create target"
          actionHref="/targets/new"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {targets.map((t) => (
            <TargetCard key={t.id} target={t} />
          ))}
        </div>
      )}
    </div>
  );
}
