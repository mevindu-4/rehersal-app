"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PersonalityProfileCard } from "@/components/targets/PersonalityProfileCard";
import type { PersonalityProfile } from "@/types";

export default function TargetDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [target, setTarget] = useState<{
    name: string;
    title?: string;
    personality_json?: PersonalityProfile;
    reconstruction_status: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/targets/${params.id}`)
      .then((r) => r.json())
      .then(setTarget);
  }, [params.id]);

  if (!target) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <PageHeader
        title={target.name}
        description={target.title}
        action={
          <Button asChild>
            <Link href={`/scenarios/new?targetId=${params.id}`}>New scenario</Link>
          </Button>
        }
      />
      {target.personality_json ? (
        <PersonalityProfileCard profile={target.personality_json} />
      ) : (
        <p className="text-muted-foreground">
          Profile not built yet.{" "}
          <Link href="/targets/new" className="text-primary">
            Add sources and reconstruct
          </Link>
        </p>
      )}
    </div>
  );
}
