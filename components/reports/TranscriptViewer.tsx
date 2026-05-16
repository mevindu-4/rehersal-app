"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionTurn } from "@/types";

export function TranscriptViewer({ turns }: { turns: SessionTurn[] }) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <div className="flex items-center justify-between">
        <p className="font-mono text-caption uppercase text-foreground-tertiary">
          Full transcript
        </p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(!open)}>
          {open ? (
            <>
              Collapse <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              Expand <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      {open && (
        <div className="mt-4 max-h-96 space-y-3 overflow-y-auto rounded-lg border border-border p-4">
          {turns.map((t) => (
            <div
              key={t.id}
              className={cn(
                "rounded-md px-3 py-2 text-small",
                t.speaker === "user"
                  ? "bg-surface-elevated text-foreground-primary"
                  : "bg-highlight-glow text-foreground-primary"
              )}
            >
              <span className="font-mono text-caption uppercase text-foreground-tertiary">
                {t.speaker} · {t.sent_at}
              </span>
              <p className="mt-1">{t.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
