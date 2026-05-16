"use client";

import { useQuery } from "@tanstack/react-query";

export interface TeamReport {
  sessions_this_week: number;
  avg_team_score: number;
  members: {
    user_id: string;
    name: string;
    sessions_count: number;
    avg_score: number;
    last_active: string | null;
  }[];
}

async function fetchTeamReport(): Promise<TeamReport> {
  const res = await fetch("/api/admin/team-report");
  const body = await res.json();
  if (!res.ok) throw new Error(body.error ?? "Failed to load team report");
  return body as TeamReport;
}

export function useTeamReport() {
  return useQuery({
    queryKey: ["admin", "team-report"],
    queryFn: fetchTeamReport,
  });
}
