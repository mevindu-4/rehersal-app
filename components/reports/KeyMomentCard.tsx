"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { KeyMoment } from "@/types";
import { SuggestedAnswer } from "./SuggestedAnswer";

export function KeyMomentCard({
  moment,
  variant,
  suggested,
}: {
  moment: KeyMoment;
  variant: "worked" | "improve";
  suggested?: { original: string; suggested: string; rationale: string };
}) {
  const [expanded, setExpanded] = useState(false);
  const border =
    variant === "worked" ? "border-l-success" : "border-l-critical";

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-surface p-4 border-l-[3px]",
        border
      )}
    >
      <p className="font-mono text-caption text-foreground-tertiary">
        {moment.timestamp}
      </p>
      <p className="mt-2 font-display text-h3 italic text-foreground-primary">
        &ldquo;{moment.user_said}&rdquo;
      </p>
      <p className="mt-2 text-small text-foreground-secondary">{moment.reason}</p>
      {suggested && variant === "improve" && (
        <>
          <button
            type="button"
            className="mt-3 text-small text-accent hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide suggestion" : "See suggested answer"}
          </button>
          {expanded && (
            <div className="mt-3">
              <SuggestedAnswer
                original={suggested.original}
                suggested={suggested.suggested}
                rationale={suggested.rationale}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
