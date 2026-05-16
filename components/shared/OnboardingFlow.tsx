"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useLibrary } from "@/lib/hooks/use-api";
import type { Role } from "@/types";

const USE_CASES = [
  { id: "interview", label: "Job interviews" },
  { id: "pitch", label: "Fundraising & pitches" },
  { id: "sales", label: "Sales conversations" },
  { id: "difficult", label: "Difficult conversations" },
  { id: "negotiation", label: "Negotiations" },
  { id: "other", label: "Something else" },
];

type InviteRow = { email: string; role: Role };

export function OnboardingFlow() {
  const router = useRouter();
  const { data: libraryData } = useLibrary({ category: "professional" });
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<"solo" | "team">("solo");
  const [workspaceName, setWorkspaceName] = useState("");
  const [useCase, setUseCase] = useState("");
  const [starterId, setStarterId] = useState<string | null>(null);
  const [invites, setInvites] = useState<InviteRow[]>([{ email: "", role: "learner" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profiles = (libraryData?.profiles ?? []).slice(0, 3) as {
    id: string;
    name: string;
    title?: string | null;
  }[];

  const totalSteps = intent === "team" ? 5 : 4;

  async function complete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent,
          workspace_name: workspaceName,
          primary_use_case: useCase,
          starter_target_id: starterId ?? undefined,
          invite_emails:
            intent === "team"
              ? invites
                  .filter((i) => i.email.trim())
                  .map((i) => ({ email: i.email.trim(), role: i.role }))
              : undefined,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Onboarding failed");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-h1 text-foreground-primary">
          Welcome to Rehearsal
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          Step {step} of {totalSteps}
        </p>
      </div>

      {step === 1 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              { id: "solo" as const, title: "Just for me", desc: "Personal practice workspace" },
              { id: "team" as const, title: "For my team", desc: "Coaching and assignments" },
            ] as const
          ).map((opt) => (
            <Card
              key={opt.id}
              className={cn(
                "cursor-pointer border-2 p-6 transition-colors",
                intent === opt.id
                  ? "border-accent bg-highlight-glow"
                  : "border-border hover:border-border-default"
              )}
              onClick={() => setIntent(opt.id)}
            >
              <h2 className="font-display text-h3">{opt.title}</h2>
              <p className="mt-2 text-small text-foreground-secondary">{opt.desc}</p>
            </Card>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Label htmlFor="workspace">Workspace name</Label>
          <Input
            id="workspace"
            placeholder={
              intent === "team" ? "Acme Sales Team" : "My Practice Space"
            }
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {USE_CASES.map((uc) => (
            <Card
              key={uc.id}
              className={cn(
                "cursor-pointer border-2 p-4",
                useCase === uc.id ? "border-accent" : "border-border"
              )}
              onClick={() => setUseCase(uc.id)}
            >
              <p className="text-body">{uc.label}</p>
            </Card>
          ))}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-body text-foreground-secondary">
            Optional: start with a library target
          </p>
          <div className="grid gap-3">
            {profiles.map((p) => (
              <Card
                key={p.id}
                className={cn(
                  "cursor-pointer border-2 p-4",
                  starterId === p.id ? "border-accent" : "border-border"
                )}
                onClick={() => setStarterId(p.id)}
              >
                <p className="font-display text-h3">{p.name}</p>
                {p.title && (
                  <p className="text-small text-foreground-secondary">{p.title}</p>
                )}
              </Card>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setStarterId(null)}>
            Skip for now
          </Button>
        </div>
      )}

      {step === 5 && intent === "team" && (
        <div className="space-y-4">
          <p className="text-small text-foreground-secondary">
            Invite up to 5 teammates (optional)
          </p>
          {invites.map((inv, i) => (
            <div key={i} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@company.com"
                value={inv.email}
                onChange={(e) => {
                  const next = [...invites];
                  next[i] = { ...next[i], email: e.target.value };
                  setInvites(next);
                }}
              />
              <Select
                value={inv.role}
                onValueChange={(v) => {
                  const next = [...invites];
                  next[i] = { ...next[i], role: v as Role };
                  setInvites(next);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="learner">Learner</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
          {invites.length < 5 && (
            <Button
              variant="ghost"
              onClick={() =>
                setInvites([...invites, { email: "", role: "learner" }])
              }
            >
              Add another
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-small text-critical">{error}</p>}

      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 1 || loading}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </Button>
        {step < totalSteps ? (
          <Button
            disabled={
              (step === 2 && !workspaceName.trim()) ||
              (step === 3 && !useCase)
            }
            onClick={() => setStep((s) => s + 1)}
          >
            Continue
          </Button>
        ) : (
          <Button disabled={loading} onClick={complete}>
            {loading ? "Setting up…" : "Go to dashboard"}
          </Button>
        )}
      </div>
    </div>
  );
}
