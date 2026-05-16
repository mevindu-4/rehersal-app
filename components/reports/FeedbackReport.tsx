"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseApiResponse } from "@/lib/parse-api-response";
import type { FeedbackReportJson } from "@/types";

export function FeedbackReport({
  report,
  reportId,
}: {
  report: FeedbackReportJson;
  reportId: string;
}) {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitRating(score: number) {
    setRating(score);
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/reports/${reportId}/rate-accuracy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accuracy_score: score,
          feedback_text: feedbackText.trim() || undefined,
        }),
      });
      const data = await parseApiResponse<{ error?: string }>(res);
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save rating");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save rating");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreGauge label="Overall" score={report.overall_score} />
        <ScoreGauge label="Target fit" score={report.target_fit_score} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executive summary</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">{report.summary}</CardContent>
      </Card>

      <section>
        <h3 className="mb-3 font-semibold">Best moments</h3>
        <div className="space-y-3">
          {report.best_moments.map((m) => (
            <Card key={m.timestamp}>
              <CardContent className="pt-4 text-sm">
                <span className="font-mono text-primary">{m.timestamp}</span>
                <p className="mt-1">{m.note}</p>
                <p className="mt-2 text-muted-foreground">{m.why_it_worked_for_target}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-semibold">Weak moments</h3>
        <div className="space-y-3">
          {report.weak_moments.map((m) => (
            <Card key={m.timestamp}>
              <CardContent className="pt-4 text-sm">
                <span className="font-mono text-primary">{m.timestamp}</span>
                <p className="mt-1">{m.note}</p>
                <p className="mt-2 text-muted-foreground">{m.why_it_matters_for_target}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-semibold">Suggested stronger answers</h3>
        {report.suggested_answers.map((s) => (
          <Card key={s.moment_timestamp} className="mb-3">
            <CardContent className="space-y-2 pt-4 text-sm">
              <p className="text-muted-foreground line-through">{s.original}</p>
              <p>{s.stronger_version}</p>
              <p className="text-xs text-muted-foreground">Grounded in: {s.grounded_in}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <h3 className="mb-3 font-semibold">Transcript</h3>
        <div className="max-h-96 space-y-2 overflow-y-auto rounded-lg border border-border p-4 text-sm">
          {report.transcript.map((t) => (
            <p key={t.sequence} className={t.speaker === "user" ? "text-foreground" : "text-primary"}>
              <span className="font-mono text-xs text-muted-foreground">{t.sent_at}</span>{" "}
              <strong>{t.speaker}:</strong> {t.message}
            </p>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate simulation accuracy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!submitted && (
            <>
              <textarea
                placeholder="Optional: what felt accurate or off?"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Button
                    key={n}
                    variant={rating === n ? "default" : "outline"}
                    size="sm"
                    disabled={submitting}
                    onClick={() => submitRating(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </>
          )}
          {submitted && (
            <p className="text-sm text-muted-foreground">
              Thanks — your rating was saved.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base">What&apos;s next?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/scenarios">Practice again</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/reports">All reports</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreGauge({ label, score }: { label: string; score: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-4xl font-bold text-primary">{score}</p>
      </CardContent>
    </Card>
  );
}
