"use client";

import { useRouter } from "next/navigation";
import { PersonalityProfileCard } from "./PersonalityProfileCard";
import { Button } from "@/components/ui/button";
import { useTarget, useUpdateTarget } from "@/lib/hooks/use-api";
import type { PersonalityJSON } from "@/types";

export function TargetBuilderStep4({ targetId }: { targetId: string }) {
  const router = useRouter();
  const { data } = useTarget(targetId);
  const updateTarget = useUpdateTarget(targetId);
  const personality = data?.target?.personality_json;

  if (!personality) {
    return (
      <p className="text-body text-foreground-secondary">
        Waiting for personality profile…
      </p>
    );
  }

  async function handleSave(updated: PersonalityJSON) {
    await updateTarget.mutateAsync({ personality_json: updated });
    router.push(`/targets/${targetId}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-h2 text-foreground-primary">
          Review personality
        </h2>
        <p className="mt-2 text-body text-foreground-secondary">
          Edit anything that does not match your target before saving.
        </p>
      </div>
      <PersonalityProfileCard
        personality={personality}
        editable
        onSave={handleSave}
      />
      <Button variant="ghost" onClick={() => router.push(`/targets/${targetId}`)}>
        Skip editing
      </Button>
    </div>
  );
}

