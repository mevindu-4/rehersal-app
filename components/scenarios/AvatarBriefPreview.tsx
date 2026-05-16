"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export function AvatarBriefPreview({
  targetId,
  trigger,
}: {
  targetId: string | null;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !targetId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/targets/${targetId}/preview`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? "Failed to load preview");
        setBrief(body.avatar_brief ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [open, targetId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline" disabled={!targetId}>
            Preview avatar brief
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="font-display text-h2">Avatar brief</DialogTitle>
        </DialogHeader>
        {loading && <LoadingSkeleton rows={4} />}
        {error && <p className="text-small text-critical">{error}</p>}
        {!loading && !error && brief && (
          <p className="text-body-lg leading-relaxed text-foreground-secondary">
            {brief}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
