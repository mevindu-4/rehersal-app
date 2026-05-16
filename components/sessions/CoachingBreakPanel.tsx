"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const COACHING_TIPS = [
  "Pause and name what you want from this conversation before you continue.",
  "Mirror their last concern, then answer with one concrete example.",
  "Ask a clarifying question instead of defending your position.",
  "Slow down — specificity beats speed under pressure.",
];

export function CoachingBreakPanel({
  onResume,
}: {
  onResume: () => void;
}) {
  const tip = COACHING_TIPS[Math.floor(Math.random() * COACHING_TIPS.length)];

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 p-8 backdrop-blur-sm">
      <p className="font-mono text-caption uppercase text-accent">Coaching break</p>
      <h2 className="mt-2 text-center font-display text-h2 text-foreground-primary">
        Take a breath
      </h2>
      <p className="mt-4 max-w-md text-center text-body text-foreground-secondary">
        {tip}
      </p>
      <Textarea
        className="mt-6 max-w-md"
        rows={3}
        placeholder="Note what you want to say next…"
        readOnly={false}
      />
      <Button className="mt-6" onClick={onResume}>
        Resume session
      </Button>
    </div>
  );
}
