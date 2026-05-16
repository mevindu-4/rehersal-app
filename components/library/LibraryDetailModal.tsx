"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PersonalityProfileCard } from "@/components/targets/PersonalityProfileCard";
import type { LibraryProfile } from "@/types";

export function LibraryDetailModal({
  profile,
  open,
  onOpenChange,
  onClone,
  cloning,
}: {
  profile: LibraryProfile | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onClone: () => void;
  cloning?: boolean;
}) {
  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[720px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-h1">{profile.name}</DialogTitle>
        </DialogHeader>

        {profile.category === "real_figure" && (
          <p className="rounded-md border border-critical/40 bg-critical/10 p-3 text-small text-foreground-secondary">
            This profile is synthesized from public information. This is a simulation
            for practice purposes.
          </p>
        )}

        <p className="text-body text-foreground-secondary">
          {profile.avatar_brief_template}
        </p>

        <PersonalityProfileCard personality={profile.profile_json} />

        <Button className="w-full" disabled={cloning} onClick={onClone}>
          {cloning ? "Cloning…" : "Clone to workspace"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
