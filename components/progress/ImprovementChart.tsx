"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SessionHistoryItem } from "@/types";
import { formatDate } from "@/lib/utils";

export function ImprovementChart({ sessions }: { sessions: SessionHistoryItem[] }) {
  const data = [...sessions]
    .reverse()
    .filter((s) => s.evaluation)
    .map((s) => ({
      date: formatDate(s.session.created_at),
      overall: s.evaluation!.overall_score,
      targetFit: s.evaluation!.target_fit_score,
    }));

  if (data.length === 0) {
    return (
      <p className="text-small text-foreground-secondary">
        Complete more sessions to see your improvement trend.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: "var(--surface-elevated)",
            border: "1px solid var(--border-default)",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="overall"
          name="Overall"
          stroke="var(--accent)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="targetFit"
          name="Target fit"
          stroke="var(--success)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
