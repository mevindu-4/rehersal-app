"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssignmentManager } from "@/components/admin/AssignmentManager";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAssignments } from "@/lib/hooks/use-api";
import { formatDate } from "@/lib/utils";
import type { AssignmentStatus } from "@/types";

const STATUS_ORDER: AssignmentStatus[] = ["pending", "overdue", "completed"];

export function AssignmentsPageClient({ isCoach }: { isCoach: boolean }) {
  const { data, isLoading } = useAssignments();
  const assignments = data?.assignments ?? [];

  if (isCoach) {
    return (
      <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
        <div>
          <h1 className="font-display text-display-2 text-foreground-primary">
            Assignments
          </h1>
          <p className="mt-2 text-body text-foreground-secondary">
            Assign scenarios to learners and track completion.
          </p>
        </div>
        <AssignmentManager isCoach />
      </div>
    );
  }

  const pending = assignments.filter((a) => a.status === "pending");
  const overdue = assignments.filter((a) => a.status === "overdue");
  const completed = assignments.filter((a) => a.status === "completed");

  return (
    <div className="mx-auto max-w-app space-y-8 p-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-display-2 text-foreground-primary">
          Your assignments
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Rehearsals assigned by your coach.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No assignments"
          description="When your coach assigns a rehearsal, it will appear here."
        />
      ) : (
        <div className="space-y-8">
          {[
            { label: "Pending", items: pending },
            { label: "Overdue", items: overdue },
            { label: "Completed", items: completed },
          ].map(
            ({ label, items }) =>
              items.length > 0 && (
                <section key={label}>
                  <h2 className="font-display text-h2 text-foreground-primary">{label}</h2>
                  <ul className="mt-4 space-y-3">
                    {items.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4"
                      >
                        <div>
                          <Badge variant="outline" className="font-mono text-caption">
                            {a.status}
                          </Badge>
                          <p className="mt-2 text-small text-foreground-secondary">
                            Due {a.due_date ? formatDate(a.due_date) : "—"}
                          </p>
                          {a.message && (
                            <p className="mt-1 text-small text-foreground-tertiary">
                              {a.message}
                            </p>
                          )}
                        </div>
                        {a.status !== "completed" && (
                          <Button size="sm" asChild>
                            <Link href={`/scenarios/${a.scenario_id}`}>
                              <Play className="mr-2 h-4 w-4" /> Start
                            </Link>
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )
          )}
        </div>
      )}
    </div>
  );
}
