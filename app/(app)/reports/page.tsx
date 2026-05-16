"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { parseApiResponse } from "@/lib/parse-api-response";

type ReportRow = {
  id: string;
  created_at: string;
  target_name: string;
  scenario_title: string;
  overall_score: number | null;
  target_fit_score: number | null;
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => parseApiResponse<ReportRow[]>(r))
      .then((data) => setReports(Array.isArray(data) ? data : []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title="Reports"
        description="Feedback from completed rehearsals"
      />

      {loading && <p className="text-muted-foreground">Loading reports…</p>}

      {!loading && reports.length === 0 && (
        <p className="text-muted-foreground">
          No reports yet. Finish a session and end it to generate feedback, or
          see recent activity on the{" "}
          <Link href="/dashboard" className="text-primary hover:underline">
            dashboard
          </Link>
          .
        </p>
      )}

      {!loading && reports.length > 0 && (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`}>
                <Card className="hover:border-primary/50">
                  <CardHeader className="py-4">
                    <CardTitle className="text-base">
                      {r.target_name} — {r.scenario_title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                      {r.overall_score != null
                        ? ` · Score ${r.overall_score} / Fit ${r.target_fit_score ?? "—"}`
                        : ""}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
