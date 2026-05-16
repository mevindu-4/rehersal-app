"use client";

import { cn, weekDayLabels } from "@/lib/utils";

export function WeekHeatmap({ counts }: { counts: number[] }) {
  const max = Math.max(...counts, 1);
  const labels = weekDayLabels();

  return (
    <div className="flex items-end gap-2">
      {counts.map((count, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col items-center gap-2">
          <div
            className={cn(
              "w-full min-h-[8px] rounded-sm transition-all duration-standard",
              count === 0
                ? "bg-surface-elevated"
                : count >= max
                  ? "bg-accent"
                  : "bg-accent/50"
            )}
            style={{ height: `${Math.max(8, (count / max) * 48)}px` }}
            title={`${count} session${count === 1 ? "" : "s"}`}
          />
          <span className="font-mono text-caption text-foreground-tertiary">
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}
