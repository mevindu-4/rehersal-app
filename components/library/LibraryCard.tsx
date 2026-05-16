"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DOMAIN_LABELS } from "@/lib/constants";
import type { LibraryProfile } from "@/types";

export function LibraryCard({
  profile,
  onPreview,
  onClone,
  cloning,
}: {
  profile: LibraryProfile;
  onPreview: () => void;
  onClone: () => void;
  cloning?: boolean;
}) {
  return (
    <Card className="group flex flex-col border border-border p-4 transition-colors hover:border-border-default">
      <Badge variant="outline" className="w-fit font-mono text-caption uppercase">
        {DOMAIN_LABELS[profile.domain]}
      </Badge>
      <h2 className="mt-2 font-display text-h2 text-foreground-primary">
        {profile.name}
      </h2>
      <p className="text-small text-foreground-secondary">
        {[profile.title, profile.company].filter(Boolean).join(" · ") || "—"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2 font-mono text-caption text-foreground-tertiary">
        <span>{profile.usage_count} uses</span>
        {profile.accuracy_rating != null && (
          <>
            <span>·</span>
            <span>{profile.accuracy_rating.toFixed(1)}★</span>
          </>
        )}
      </div>
      <div className="mt-4 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="sm" onClick={onPreview}>
          Preview
        </Button>
        <Button size="sm" disabled={cloning} onClick={onClone}>
          {cloning ? "Cloning…" : "Clone"}
        </Button>
      </div>
    </Card>
  );
}
