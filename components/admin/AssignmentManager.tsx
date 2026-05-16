"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { useAssignments, useCreateAssignment, useScenarios } from "@/lib/hooks/use-api";
import { formatDate } from "@/lib/utils";
import type { AssignmentStatus } from "@/types";

export function AssignmentManager({ isCoach }: { isCoach: boolean }) {
  const { data, isLoading } = useAssignments();
  const { data: scenariosData } = useScenarios();
  const createAssignment = useCreateAssignment();
  const [open, setOpen] = useState(false);
  const [scenarioId, setScenarioId] = useState("");
  const [learnerEmails, setLearnerEmails] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [message, setMessage] = useState("");

  const assignments = data?.assignments ?? [];
  const scenarios = scenariosData?.scenarios ?? [];

  const grouped: Record<AssignmentStatus, typeof assignments> = {
    pending: [],
    completed: [],
    overdue: [],
  };
  for (const a of assignments) {
    grouped[a.status].push(a);
  }

  async function submit() {
    const emails = learnerEmails
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter(Boolean);
    await createAssignment.mutateAsync({
      learner_ids: emails,
      scenario_id: scenarioId,
      due_date: dueDate || undefined,
      message: message || undefined,
    });
    setOpen(false);
  }

  if (isLoading) return <LoadingSkeleton rows={5} />;

  if (!isCoach) {
    return (
      <div className="space-y-6">
        <h2 className="font-display text-h2">Your assignments</h2>
        <ul className="space-y-3">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div>
                <p className="font-display text-h3">Scenario {a.scenario_id.slice(0, 8)}…</p>
                <p className="text-small text-foreground-secondary">
                  Due {a.due_date ? formatDate(a.due_date) : "—"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="capitalize">{a.status}</Badge>
                {a.status === "pending" && (
                  <Button size="sm" asChild>
                    <a href={`/scenarios/${a.scenario_id}`}>Start</a>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-h2">Assignments</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>New assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Scenario</Label>
                <Select value={scenarioId} onValueChange={setScenarioId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Learner emails (comma or newline)</Label>
                <Textarea
                  value={learnerEmails}
                  onChange={(e) => setLearnerEmails(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <Label>Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <Button
                disabled={!scenarioId || !learnerEmails.trim() || createAssignment.isPending}
                onClick={() => void submit()}
              >
                Assign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {(["pending", "completed", "overdue"] as const).map((status) => (
        <section key={status}>
          <h3 className="font-mono text-caption uppercase text-foreground-tertiary">
            {status}
          </h3>
          <ul className="mt-3 space-y-2">
            {grouped[status].length === 0 ? (
              <li className="text-small text-foreground-secondary">None</li>
            ) : (
              grouped[status].map((a) => (
                <li
                  key={a.id}
                  className="rounded-md border border-border px-4 py-3 text-small"
                >
                  Scenario {a.scenario_id.slice(0, 8)}… · due{" "}
                  {a.due_date ? formatDate(a.due_date) : "—"}
                </li>
              ))
            )}
          </ul>
        </section>
      ))}
    </div>
  );
}
