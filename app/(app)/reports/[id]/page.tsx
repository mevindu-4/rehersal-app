"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { FeedbackReport } from "@/components/reports/FeedbackReport";
import type { FeedbackReportJson } from "@/types";

export default function ReportPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<FeedbackReportJson | null>(null);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((r) => r.json())
      .then(setReport);
  }, [params.id]);

  if (!report) {
    return <p className="text-muted-foreground">Loading report…</p>;
  }

  return (
    <div>
      <PageHeader
        title={`Report — ${report.target_name}`}
        description={`${report.conversation_type} · ${new Date(report.session_date).toLocaleDateString()}`}
      />
      <FeedbackReport report={report} reportId={params.id} />
    </div>
  );
}
