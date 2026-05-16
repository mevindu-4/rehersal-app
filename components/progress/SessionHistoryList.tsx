"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { SessionHistoryItem } from "@/types";

export function SessionHistoryList({
  sessions,
  limit,
}: {
  sessions: SessionHistoryItem[];
  limit?: number;
}) {
  const list = limit ? sessions.slice(0, limit) : sessions;

  if (list.length === 0) {
    return (
      <p className="text-small text-foreground-secondary">No sessions yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-border-subtle rounded-lg border border-border">
      {list.map(({ session, scenario, target, evaluation }) => (
        <li key={session.id}>
          <Link
            href={
              session.status === "report_ready"
                ? `/sessions/${session.id}`
                : `/scenarios/${session.scenario_id}`
            }
            className="flex flex-wrap items-center justify-between gap-2 px-4 py-4 transition-colors hover:bg-surface-elevated"
          >
            <div>
              <p className="font-display text-h3 text-foreground-primary">
                {target?.name ?? scenario?.title ?? "Session"}
              </p>
              <p className="text-small text-foreground-secondary">
                {formatDate(session.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {evaluation && (
                <span className="font-mono text-h3 text-accent">
                  {evaluation.overall_score}
                </span>
              )}
              <Badge variant="outline" className="capitalize">
                {session.status.replace("_", " ")}
              </Badge>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
