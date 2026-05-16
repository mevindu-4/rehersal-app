"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useCreateSession } from "@/lib/hooks/use-api";
import type { Scenario, TargetProfile, UserDocument } from "@/types";

type Check = "mic" | "camera" | "consent";

export function PreSessionChecklist({
  scenario,
  target,
  documents,
  assignmentId,
  existingSession,
  onSessionReady,
}: {
  scenario: Scenario;
  target: TargetProfile;
  documents: UserDocument[];
  assignmentId?: string;
  existingSession?: { id: string; joinUrl: string };
  onSessionReady: (sessionId: string, joinUrl: string) => void;
}) {
  const router = useRouter();
  const createSession = useCreateSession();
  const [checks, setChecks] = useState<Record<Check, boolean>>({
    mic: false,
    camera: false,
    consent: false,
  });
  const [mediaError, setMediaError] = useState<string | null>(null);

  const testMedia = useCallback(async (audio: boolean, video: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const mic = await testMedia(true, false);
      const cam = await testMedia(false, true);
      setChecks((c) => ({ ...c, mic, camera: cam }));
      if (!mic && !cam) setMediaError("Allow microphone and camera to continue.");
    })();
  }, [testMedia]);

  const docNames =
    documents
      .filter((d) => scenario.included_document_ids.includes(d.id))
      .map((d) => d.filename)
      .join(", ") || "No documents attached";

  const allReady = checks.mic && checks.camera && checks.consent;

  async function startSession() {
    if (existingSession) {
      onSessionReady(existingSession.id, existingSession.joinUrl);
      return;
    }
    const { session, join_url } = await createSession.mutateAsync({
      scenario_id: scenario.id,
      assignment_id: assignmentId,
    });
    onSessionReady(session.id, join_url);
    router.replace(`/sessions/${session.id}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-display text-h1 text-foreground-primary">
          Pre-session checklist
        </h1>
        <p className="mt-2 text-body text-foreground-secondary">
          You&apos;ll be speaking with:{" "}
          <span className="text-foreground-primary">{target.name}</span>
        </p>
      </div>

      <ul className="space-y-4">
        {(
          [
            { key: "mic" as const, label: "Microphone access" },
            { key: "camera" as const, label: "Camera access" },
          ] as const
        ).map(({ key, label }) => (
          <li
            key={key}
            className="flex items-center gap-3 rounded-lg border border-border p-4"
          >
            {checks[key] ? (
              <Check className="h-5 w-5 text-success" />
            ) : (
              <X className="h-5 w-5 text-critical" />
            )}
            <span className="flex-1 text-body">{label}</span>
            {!checks[key] && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  const ok = await testMedia(key === "mic", key === "camera");
                  setChecks((c) => ({ ...c, [key]: ok }));
                }}
              >
                Test
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="rounded-lg border border-border bg-surface-elevated p-4">
        <p className="text-caption font-mono uppercase text-foreground-tertiary">
          Context
        </p>
        <p className="mt-2 text-small text-foreground-secondary">
          The avatar knows about: {docNames}
        </p>
      </div>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={checks.consent}
          onCheckedChange={(v) =>
            setChecks((c) => ({ ...c, consent: v === true }))
          }
        />
        <Label htmlFor="consent" className="text-small leading-relaxed">
          I understand this is an AI avatar and my conversation will be
          transcribed for feedback.
        </Label>
      </div>

      {mediaError && <p className="text-small text-critical">{mediaError}</p>}

      <Button
        className="w-full"
        disabled={!allReady || (!existingSession && createSession.isPending)}
        onClick={() => void startSession()}
      >
        {!existingSession && createSession.isPending ? "Starting…" : "Start session"}
      </Button>
    </div>
  );
}
