"use client";

import { DIFFICULTY_LABELS } from "@/lib/constants";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";

export function DifficultySlider({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}) {
  const idx = value - 1;

  return (
    <div className="space-y-4">
      <Slider
        min={1}
        max={5}
        step={1}
        value={[value]}
        onValueChange={([v]) => onChange(v as Difficulty)}
        className="[&_[role=slider]]:border-accent [&_.relative]:bg-gradient-to-r [&_.relative]:from-success [&_.relative]:via-accent [&_.relative]:to-critical"
      />
      <div className="flex justify-between gap-1">
        {DIFFICULTY_LABELS.map((label, i) => (
          <span
            key={label}
            className={cn(
              "flex-1 text-center text-caption",
              i === idx
                ? "font-medium text-accent"
                : "text-foreground-tertiary"
            )}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
