"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";

export default function ProgressPage() {
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      created_at: string;
      target_profiles?: { name: string };
      evaluations?: Array<{ overall_score: number; target_fit_score: number }>;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then(setSessions);
  }, []);

  const scores = sessions
    .filter((s) => s.evaluations?.[0])
    .map((s) => s.evaluations![0].overall_score);

  const avg =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  return (
    <div>
      <PageHeader title="Progress" description="Scores across rehearsals" />
      {avg !== null && (
        <p className="mb-6 text-lg">
          Average overall score: <strong className="text-primary">{avg}</strong>
        </p>
      )}
      <ul className="space-y-2 text-sm">
        {sessions.map((s) => (
          <li key={s.id} className="flex justify-between border-b border-border py-2">
            <span>
              {s.target_profiles?.name} · {new Date(s.created_at).toLocaleDateString()}
            </span>
            <span className="text-muted-foreground">
              {s.evaluations?.[0]?.overall_score ?? "—"}
            </span>
          </li>
        ))}
      </ul>
      <Link href="/dashboard" className="mt-6 inline-block text-sm text-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
