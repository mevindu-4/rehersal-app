"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { scoreDescriptor } from "@/lib/utils";

export function ScoreGauge({
  score,
  label,
  color = "amber",
  size = "lg",
}: {
  score: number;
  label: string;
  color?: "amber" | "sage";
  size?: "sm" | "lg";
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    let frame: number;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(score * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const stroke = color === "sage" ? "var(--success)" : "var(--accent)";
  const r = size === "lg" ? 52 : 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (display / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size === "lg" ? 128 : 88}
        height={size === "lg" ? 128 : 88}
        className="-rotate-90"
      >
        <circle
          cx={size === "lg" ? 64 : 44}
          cy={size === "lg" ? 64 : 44}
          r={r}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={8}
        />
        <circle
          cx={size === "lg" ? 64 : 44}
          cy={size === "lg" ? 64 : 44}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-300 ease-out"
        />
      </svg>
      <span
        className={cn(
          "font-display tabular-nums text-foreground-primary",
          size === "lg" ? "text-display-2" : "text-h1"
        )}
      >
        {display}
      </span>
      <span className="font-mono text-caption uppercase text-foreground-tertiary">
        {label}
      </span>
      <span className="text-small text-foreground-secondary">
        {scoreDescriptor(score)}
      </span>
    </div>
  );
}
