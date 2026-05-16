"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SessionEmbed } from "@/components/sessions/SessionEmbed";
import { CoachingBreakPanel } from "@/components/sessions/CoachingBreakPanel";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { TargetProfile } from "@/types";

export function LiveSessionPanel({
  sessionId,
  target,
  joinUrl,
  durationMinutes,
  onEnded,
}: {
  sessionId: string;
  target: TargetProfile;
  joinUrl: string;
  durationMinutes: number;
  onEnded: () => void;
}) {
  const totalSeconds = durationMinutes * 60;
  const [elapsed, setElapsed] = useState(0);
  const [ending, setEnding] = useState(false);
  const [coachingBreak, setCoachingBreak] = useState(false);

  const remaining = Math.max(0, totalSeconds - elapsed);
  const lastMinute = remaining <= 60 && remaining > 0;

  useEffect(() => {
    if (coachingBreak) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [coachingBreak]);

  useEffect(() => {
    if (remaining <= 0 && !ending) void endSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  async function endSession() {
    setEnding(true);
    try {
      await fetch(`/api/sessions/${sessionId}/end`, { method: "POST" });
      onEnded();
    } finally {
      setEnding(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h1 className="font-display text-h2 text-foreground-primary">
          {target.name}
        </h1>
        <span
          className={cn(
            "font-mono text-h1 tabular-nums",
            lastMinute && "animate-pulse-amber text-accent"
          )}
        >
          {formatDuration(remaining)}
        </span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            disabled={coachingBreak}
            onClick={() => setCoachingBreak(true)}
          >
            Coaching break
          </Button>
          <Button
            variant="outline"
            disabled={ending}
            onClick={() => void endSession()}
          >
            {ending ? "Ending…" : "End session"}
          </Button>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center p-6">
        <SessionEmbed joinUrl={joinUrl} />
        {coachingBreak && (
          <CoachingBreakPanel onResume={() => setCoachingBreak(false)} />
        )}
      </div>
    </div>
  );
}
