"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRateAccuracy } from "@/lib/hooks/use-api";
import { cn } from "@/lib/utils";

export function AccuracyRater({
  reportId,
  sessionId,
}: {
  reportId: string;
  sessionId: string;
}) {
  const rate = useRateAccuracy(reportId);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    if (score < 1) return;
    await rate.mutateAsync({
      accuracy_score: score,
      feedback_text: feedback || undefined,
    });
    setDone(true);
  }

  return (
    <section className="rounded-lg border border-border p-6">
      <p className="font-mono text-caption uppercase text-foreground-tertiary">
        How accurate was this?
      </p>
      <p className="mt-2 text-small text-foreground-secondary">
        Rate how well the avatar matched your real target (session {sessionId.slice(0, 8)}…)
      </p>
      <div className="mt-4 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setScore(n)}
            className="rounded-md p-1 transition-colors hover:bg-surface-elevated"
            aria-label={`${n} stars`}
          >
            <Star
              className={cn(
                "h-6 w-6",
                n <= score ? "fill-accent text-accent" : "text-foreground-tertiary"
              )}
              strokeWidth={1.5}
            />
          </button>
        ))}
      </div>
      <Textarea
        className="mt-4"
        placeholder="Optional feedback…"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        rows={3}
      />
      <Button
        className="mt-4"
        disabled={done || rate.isPending || score < 1}
        onClick={() => void submit()}
      >
        {done ? "Thanks!" : "Submit rating"}
      </Button>
    </section>
  );
}
