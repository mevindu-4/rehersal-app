"use client";

import { DOC_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DocType } from "@/types";

const TYPES = Object.keys(DOC_TYPE_LABELS) as DocType[];

export function DocumentTypeSelector({
  value,
  onChange,
}: {
  value: DocType;
  onChange: (t: DocType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            "rounded-md border px-3 py-1.5 text-small",
            value === t
              ? "border-accent bg-highlight-glow text-foreground-primary"
              : "border-border text-foreground-secondary hover:border-border-default"
          )}
        >
          {DOC_TYPE_LABELS[t]}
        </button>
      ))}
    </div>
  );
}
