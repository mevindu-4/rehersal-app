"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PreSessionChecklist } from "@/components/sessions/PreSessionChecklist";
import { LiveSessionPanel } from "@/components/sessions/LiveSessionPanel";
import { GeneratingReportState } from "@/components/sessions/GeneratingReportState";
import { useDocuments, useSession } from "@/lib/hooks/use-api";
import type { Scenario, TargetProfile } from "@/types";

export function SessionPageClient({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [live, setLive] = useState(false);
  const { data, isLoading } = useSession(sessionId, {
    refetchInterval: live ? 0 : 5000,
  });
  const { data: docsData } = useDocuments();

  const session = data?.session;
  const scenario = data?.scenario as Scenario | null;
  const target = data?.target as TargetProfile | null;
  const reportId = data?.report_id;

  useEffect(() => {
    if (session?.status === "report_ready" && reportId) {
      router.replace(`/reports/${reportId}`);
    }
  }, [session?.status, reportId, router]);

  useEffect(() => {
    if (session?.status === "live") setLive(true);
  }, [session?.status]);

  if (isLoading || !session || !scenario || !target) {
    return (
      <div className="mx-auto max-w-app p-8">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  if (session.status === "failed") {
    return (
      <div className="mx-auto max-w-app p-8">
        <p className="text-critical">
          {session.error_message ?? "Session failed. Please try again."}
        </p>
      </div>
    );
  }

  if (session.status === "ended" || session.status === "evaluating") {
    return <GeneratingReportState sessionId={sessionId} />;
  }

  if (
    live ||
    session.status === "live"
  ) {
    return (
      <LiveSessionPanel
        sessionId={sessionId}
        target={target}
        joinUrl={session.join_url ?? ""}
        durationMinutes={scenario.duration_minutes}
        onEnded={() => setLive(false)}
      />
    );
  }

  if (session.status === "ready" || session.status === "created") {
    return (
      <div className="mx-auto max-w-app p-8">
        <PreSessionChecklist
          scenario={scenario}
          target={target}
          documents={docsData?.documents ?? []}
          existingSession={{ id: sessionId, joinUrl: session.join_url ?? "" }}
          onSessionReady={() => setLive(true)}
        />
      </div>
    );
  }

  return <GeneratingReportState sessionId={sessionId} />;
}
