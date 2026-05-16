"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ExecutiveSummary } from "@/components/reports/ExecutiveSummary";
import { KeyMomentCard } from "@/components/reports/KeyMomentCard";
import { CommunicationNotes } from "@/components/reports/CommunicationNotes";
import { TranscriptViewer } from "@/components/reports/TranscriptViewer";
import { AccuracyRater } from "@/components/reports/AccuracyRater";
import { CoachCommentBox } from "@/components/reports/CoachCommentBox";
import { ScoreGauge } from "@/components/reports/ScoreGauge";
import { useReport } from "@/lib/hooks/use-api";
import { CONVERSATION_TYPES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import type { CoachComment, SessionTurn } from "@/types";

export function FeedbackReport({
  reportId,
  showCoachTools = false,
}: {
  reportId: string;
  showCoachTools?: boolean;
}) {
  const { data, isLoading } = useReport(reportId);
  const [exporting, setExporting] = useState(false);

  if (isLoading || !data) return <LoadingSkeleton rows={8} />;

  const { report, evaluation, coach_comments, scenario_id, turns } = data;
  const sessionTurns = (turns ?? []) as SessionTurn[];
  const json = report.report_json;
  const typeLabel =
    CONVERSATION_TYPES.find((c) => c.id === json.conversation_type)?.label ??
    json.conversation_type;

  const overall = evaluation?.overall_score ?? json.overall_score;
  const targetFit = evaluation?.target_fit_score ?? json.target_fit_score;

  async function exportPdf() {
    setExporting(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/pdf`, { method: "POST" });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Export failed");
      if (body.pdf_url) {
        window.open(body.pdf_url, "_blank");
        toast({ title: "PDF ready", description: "Opening download…" });
      }
    } catch (e) {
      toast({
        title: "PDF export failed",
        description: e instanceof Error ? e.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied to clipboard" });
    } catch {
      toast({
        title: "Could not copy link",
        variant: "destructive",
      });
    }
  }

  return (
    <article className="animate-fade-in-up">
      <div className="flex justify-end gap-2 px-4 pt-6 sm:px-8">
        <Button variant="outline" size="sm" onClick={() => void copyLink()}>
          <Copy className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button variant="outline" size="sm" disabled={exporting} onClick={() => void exportPdf()}>
          <Download className="mr-2 h-4 w-4" />
          {exporting ? "Exporting…" : "Export PDF"}
        </Button>
      </div>

      <header className="bg-highlight-glow px-4 py-10 sm:px-8 sm:py-12">
        <p className="font-mono text-caption uppercase text-foreground-tertiary">
          Rehearsal complete
        </p>
        <h1 className="mt-2 font-display text-display-2 text-foreground-primary">
          {json.target_name}
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">{typeLabel}</p>
        <p className="font-mono text-small text-foreground-tertiary">
          {formatDate(json.session_date)}
        </p>
        <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:flex-wrap sm:justify-start sm:gap-12">
          <ScoreGauge score={overall} label="Overall" />
          <ScoreGauge score={targetFit} label="Target fit" color="sage" />
        </div>
      </header>

      <div className="mx-auto max-w-app space-y-12 px-4 py-10 sm:px-8 sm:py-12">
        <ExecutiveSummary text={json.executive_summary} />

        <section>
          <p className="font-mono text-caption uppercase text-foreground-tertiary">
            What worked
          </p>
          <div className="mt-4 space-y-4">
            {json.best_moments.map((m, i) => (
              <KeyMomentCard key={i} moment={m} variant="worked" />
            ))}
          </div>
        </section>

        <section>
          <p className="font-mono text-caption uppercase text-foreground-tertiary">
            What to improve
          </p>
          <div className="mt-4 space-y-4">
            {json.weak_moments.map((m, i) => {
              const sug = json.suggested_answers.find(
                (s) => s.timestamp === m.timestamp
              );
              return (
                <KeyMomentCard
                  key={i}
                  moment={m}
                  variant="improve"
                  suggested={
                    sug
                      ? {
                          original: sug.original,
                          suggested: sug.suggested,
                          rationale: sug.rationale,
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        </section>

        {json.missed_signals.length > 0 && (
          <section>
            <p className="font-mono text-caption uppercase text-foreground-tertiary">
              What you missed
            </p>
            <ul className="mt-4 space-y-3">
              {json.missed_signals.map((s, i) => (
                <li
                  key={i}
                  className="rounded-md border border-border p-4 text-small"
                >
                  <span className="font-mono text-caption">{s.timestamp}</span>
                  <p className="mt-1 text-foreground-primary">{s.avatar_signal}</p>
                  <p className="text-foreground-secondary">{s.likely_meaning}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <CommunicationNotes notes={json.communication_notes} />

        {sessionTurns.length > 0 && <TranscriptViewer turns={sessionTurns} />}

        <AccuracyRater reportId={reportId} sessionId={report.session_id} />

        {showCoachTools && (
          <CoachCommentBox
            reportId={reportId}
            sessionId={report.session_id}
            existing={coach_comments as CoachComment[]}
          />
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link
            href={scenario_id ? `/scenarios/${scenario_id}` : "/scenarios"}
            className="rounded-lg border border-border p-6 transition-colors hover:border-accent"
          >
            <p className="font-display text-h3">Run this again</p>
            <p className="mt-2 text-small text-foreground-secondary">
              Practice the same scenario
            </p>
          </Link>
          <Link
            href="/scenarios/new"
            className="rounded-lg border border-border p-6 transition-colors hover:border-accent"
          >
            <p className="font-display text-h3">Try a different scenario</p>
            <p className="mt-2 text-small text-foreground-secondary">
              New context or target
            </p>
          </Link>
        </section>
      </div>
    </article>
  );
}
