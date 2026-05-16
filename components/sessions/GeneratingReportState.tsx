"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useSession } from "@/lib/hooks/use-api";

const STATUS_LINES = [
  "Syncing transcript…",
  "Analyzing delivery…",
  "Scoring against rubric…",
  "Building your report…",
];

export function GeneratingReportState({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [lineIndex, setLineIndex] = useState(0);
  const { data } = useSession(sessionId, { refetchInterval: 5000 });
  const session = data?.session;
  const reportId = data?.report_id;

  useEffect(() => {
    if (session?.status === "report_ready" && reportId) {
      router.replace(`/reports/${reportId}`);
    }
  }, [session?.status, reportId, router]);

  useEffect(() => {
    const t = setInterval(() => {
      setLineIndex((i) => (i + 1) % STATUS_LINES.length);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const progress =
    session?.status === "evaluating"
      ? 40 + lineIndex * 15
      : session?.status === "ended"
        ? 25
        : 66;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center animate-fade-in-up">
      <h1 className="font-display text-h1 text-foreground-primary">
        Reviewing your session…
      </h1>
      <p className="mt-4 text-body text-foreground-secondary">
        {STATUS_LINES[lineIndex]}
      </p>
      <Progress value={progress} className="mt-8 h-2 w-full" />
      <p className="mt-4 font-mono text-caption text-foreground-tertiary">
        Status: {session?.status ?? "evaluating"}
      </p>
    </div>
  );
}
