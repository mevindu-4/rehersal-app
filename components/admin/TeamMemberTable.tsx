"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useTeamReport } from "@/lib/hooks/use-team-report";
import { formatDate } from "@/lib/utils";

export function TeamMemberTable() {
  const { data, isLoading } = useTeamReport();

  if (isLoading) return <LoadingSkeleton rows={5} />;

  const members = data?.members ?? [];

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-small">
        <thead className="border-b border-border bg-surface-elevated">
          <tr>
            <th className="px-4 py-3 font-mono text-caption uppercase">Member</th>
            <th className="px-4 py-3 font-mono text-caption uppercase">Sessions</th>
            <th className="px-4 py-3 font-mono text-caption uppercase">Avg score</th>
            <th className="px-4 py-3 font-mono text-caption uppercase">Last active</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.user_id} className="border-b border-border-subtle">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {m.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{m.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">{m.sessions_count}</td>
              <td className="px-4 py-3">
                <Badge variant="outline">{m.avg_score || "—"}</Badge>
              </td>
              <td className="px-4 py-3 text-foreground-secondary">
                {m.last_active ? formatDate(m.last_active) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
