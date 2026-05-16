"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { RubricScore } from "@/types";

const DEFAULT_DIMS = [
  "Structure",
  "Specificity",
  "Pressure Handling",
  "Directness",
  "Target Fit",
  "Evidence Quality",
];

export function SkillRadar({ scores }: { scores: RubricScore[] }) {
  const map = new Map(scores.map((s) => [s.dimension, s.score]));
  const data = DEFAULT_DIMS.map((dimension) => ({
    dimension,
    score: map.get(dimension) ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border-subtle)" />
        <PolarAngleAxis
          dataKey="dimension"
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
        />
        <Radar
          name="Skills"
          dataKey="score"
          stroke="var(--accent)"
          fill="var(--accent)"
          fillOpacity={0.2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
