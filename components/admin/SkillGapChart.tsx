"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export function SkillGapChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "team-report"],
    queryFn: async () => {
      const res = await fetch("/api/admin/team-report");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      return body as {
        skill_gaps: { dimension: string; avg: number }[];
      };
    },
  });

  if (isLoading) return <LoadingSkeleton rows={4} />;

  const chartData = [...(data?.skill_gaps ?? [])].sort((a, b) => a.avg - b.avg);
  const minAvg = chartData[0]?.avg ?? 0;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "var(--text-tertiary)" }} />
        <YAxis
          type="category"
          dataKey="dimension"
          tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          width={72}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-default)",
          }}
        />
        <Bar
          dataKey="avg"
          fill="var(--accent)"
          radius={[0, 4, 4, 0]}
          shape={(props: { x?: number; y?: number; width?: number; height?: number; payload?: { avg: number } }) => {
            const { x = 0, y = 0, width = 0, height = 0, payload } = props;
            const fill =
              payload?.avg === minAvg ? "var(--critical)" : "var(--accent)";
            return <rect x={x} y={y} width={width} height={height} fill={fill} rx={4} />;
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
