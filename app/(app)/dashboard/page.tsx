"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const [sessions, setSessions] = useState<
    Array<{
      id: string;
      created_at: string;
      target_profiles?: { name: string };
      scenarios?: { title: string };
      evaluations?: Array<{ overall_score: number; target_fit_score: number }>;
      feedback_reports?: Array<{ id: string }>;
    }>
  >([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  return (
    <div>
      <PageHeader
        badge="Command center"
        title="Dashboard"
        description="Recent rehearsals and quick actions"
        action={
          <Button asChild>
            <Link href="/targets/new">New target</Link>
          </Button>
        }
      />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Sessions", value: sessions.length, href: "/reports" },
          {
            label: "With reports",
            value: sessions.filter((s) => s.feedback_reports?.length).length,
            href: "/reports",
          },
          { label: "Quick start", value: "→", href: "/scenarios" },
        ].map((stat, i) => (
          <Link key={stat.label} href={stat.href}>
            <Card
              className={cn(
                "h-full animate-scale-in opacity-0 [animation-fill-mode:forwards]",
                i === 0 && "stagger-1",
                i === 1 && "stagger-2",
                i === 2 && "stagger-3"
              )}
            >
              <CardContent className="flex flex-col justify-between p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tabular-nums text-gradient">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {sessions.length === 0 ? (
        <Card className="border-dashed border-white/10">
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">
              No sessions yet. Clone an archetype or build a target to begin.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/library">Browse library</Link>
              </Button>
              <Button asChild>
                <Link href="/targets/new">Create target</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {sessions.slice(0, 10).map((s, i) => (
            <li
              key={s.id}
              className={cn(
                "animate-fade-up opacity-0 [animation-fill-mode:forwards]",
                i === 0 && "stagger-1",
                i === 1 && "stagger-2",
                i === 2 && "stagger-3",
                i === 3 && "stagger-4",
                i === 4 && "stagger-5",
                i >= 5 && "stagger-6"
              )}
            >
              <Link
                className="group block"
                href={
                  s.feedback_reports?.[0]?.id
                    ? `/reports/${s.feedback_reports[0].id}`
                    : `/sessions/${s.id}`
                }
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between py-4">
                    <div>
                      <CardTitle className="text-base font-medium">
                        {s.target_profiles?.name ?? "Session"} — {s.scenarios?.title}
                      </CardTitle>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                        {s.evaluations?.[0]
                          ? ` · Score ${s.evaluations[0].overall_score} · Fit ${s.evaluations[0].target_fit_score}`
                          : ""}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition duration-300 group-hover:translate-x-1 group-hover:text-cyan-400" />
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
