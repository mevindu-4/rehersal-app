"use client";

import { useParams, useRouter } from "next/navigation";
import { PersonalityProfileCard } from "@/components/targets/PersonalityProfileCard";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useTarget, useUpdateTarget } from "@/lib/hooks/use-api";
import type { PersonalityJSON } from "@/types";

export default function EditTargetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading } = useTarget(id);
  const updateTarget = useUpdateTarget(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-app p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const personality = data?.target?.personality_json;
  if (!personality) {
    return (
      <div className="mx-auto max-w-app p-8">
        <p className="text-foreground-secondary">No personality profile to edit yet.</p>
      </div>
    );
  }

  async function handleSave(updated: PersonalityJSON) {
    await updateTarget.mutateAsync({ personality_json: updated });
    router.push(`/targets/${id}`);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-app space-y-8 p-8">
      <h1 className="font-display text-h1 text-foreground-primary">Edit target</h1>
      <PersonalityProfileCard
        personality={personality}
        editable
        onSave={handleSave}
      />
    </div>
  );
}
