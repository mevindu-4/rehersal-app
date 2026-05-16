"use client";

import { Flame } from "lucide-react";

export function StreakTracker({ streak }: { streak: number }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
      <Flame
        className={streak > 0 ? "text-accent" : "text-foreground-tertiary"}
        strokeWidth={1.5}
      />
      <div>
        <p className="font-display text-h2 text-foreground-primary">{streak}</p>
        <p className="text-small text-foreground-secondary">day streak</p>
      </div>
    </div>
  );
}
