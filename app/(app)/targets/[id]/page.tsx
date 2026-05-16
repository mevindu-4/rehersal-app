"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PersonalityProfileCard } from "@/components/targets/PersonalityProfileCard";
import { useTarget } from "@/lib/hooks/use-api";
import { DOMAIN_LABELS } from "@/lib/constants";

export default function TargetProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { data, isLoading } = useTarget(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-app p-8">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  const target = data?.target;
  if (!target) {
    return (
      <div className="mx-auto max-w-app p-8">
        <p className="text-critical">Target not found.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-caption uppercase text-foreground-tertiary">
            {DOMAIN_LABELS[target.domain]}
          </p>
          <h1 className="mt-2 font-display text-display-2 text-foreground-primary">
            {target.name}
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            {[target.title, target.company].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/targets/${id}/edit`}>Edit profile</Link>
        </Button>
      </div>

      {target.personality_json ? (
        <PersonalityProfileCard personality={target.personality_json} />
      ) : (
        <p className="text-body text-foreground-secondary">
          Profile still building (status: {target.status}).
        </p>
      )}

      <div className="flex gap-3">
        <Button asChild>
          <Link href={`/scenarios/new?target=${id}`}>Create scenario</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/targets">Back to targets</Link>
        </Button>
      </div>
    </div>
  );
}
