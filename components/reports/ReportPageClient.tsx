"use client";

import { FeedbackReport } from "@/components/reports/FeedbackReport";

export function ReportPageClient({
  reportId,
  showCoachTools,
}: {
  reportId: string;
  showCoachTools: boolean;
}) {
  return (
    <div className="mx-auto max-w-app p-8">
      <FeedbackReport reportId={reportId} showCoachTools={showCoachTools} />
    </div>
  );
}
