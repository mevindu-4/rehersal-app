"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { TargetProfile } from "@/types";

export function TargetCard({
  target,
  onLaunch,
}: {
  target: TargetProfile;
  onLaunch?: (id: string) => void;
}) {
  return (
    <Card className="flex flex-col border border-border p-4 transition-colors hover:border-border-default">
      <Badge variant="outline" className="w-fit font-mono text-caption uppercase">
        {target.domain}
      </Badge>
      <h2 className="mt-2 font-display text-h2 text-foreground-primary">
        {target.name}
      </h2>
      <p className="text-small text-foreground-secondary">
        {[target.title, target.company].filter(Boolean).join(" · ") || "—"}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-caption font-mono text-foreground-tertiary">
        <span>{target.session_count} sessions</span>
        <span>·</span>
        <span>
          {target.accuracy_rating != null
            ? `${target.accuracy_rating.toFixed(1)}★`
            : "— accuracy"}
        </span>
        <span>·</span>
        <span>{formatDate(target.updated_at)}</span>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/targets/${target.id}`}>View</Link>
        </Button>
        {onLaunch && target.status === "complete" && (
          <Button size="sm" variant="outline" onClick={() => onLaunch(target.id)}>
            Rehearse <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </Card>
  );
}
