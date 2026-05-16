"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PersonalityProfileCard } from "@/components/targets/PersonalityProfileCard";
import { useCloneLibraryProfile, useLibraryProfile } from "@/lib/hooks/use-api";
import { DOMAIN_LABELS } from "@/lib/constants";
import type { LibraryProfile, PersonalityJSON } from "@/types";

export default function LibraryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data, isLoading } = useLibraryProfile(id);
  const clone = useCloneLibraryProfile();

  const profile = data?.profile as LibraryProfile | undefined;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-app p-8">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-app p-8">
        <p className="text-critical">Profile not found.</p>
      </div>
    );
  }

  async function handleClone() {
    const { target } = await clone.mutateAsync(id);
    router.push(`/targets/${target.id}`);
  }

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      {profile.category === "real_figure" && (
        <div className="rounded-lg border border-border bg-surface-elevated p-4 text-small text-foreground-secondary">
          This profile is synthesized from public information. This is a simulation for
          practice purposes.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-caption uppercase text-foreground-tertiary">
            {DOMAIN_LABELS[profile.domain]}
          </p>
          <h1 className="mt-2 font-display text-display-2 text-foreground-primary">
            {profile.name}
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            {[profile.title, profile.company].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <Button onClick={handleClone} disabled={clone.isPending}>
          Clone to workspace
        </Button>
      </div>

      <PersonalityProfileCard
        personality={profile.profile_json as PersonalityJSON}
      />

      <Button variant="ghost" asChild>
        <Link href="/library">Back to library</Link>
      </Button>
    </div>
  );
}
