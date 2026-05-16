"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseApiResponse } from "@/lib/parse-api-response";

const LiveAvatarRoom = dynamic(
  () =>
    import("@/components/sessions/LiveAvatarRoom").then((m) => m.LiveAvatarRoom),
  { ssr: false, loading: () => <p className="text-sm text-muted-foreground">Connecting…</p> }
);

type SessionState = "precheck" | "live" | "ending" | "report";

type SessionData = {
  join_url?: string;
  livekit_token?: string;
  target_profiles?: { name: string };
  scenarios?: { title: string; conversation_type: string };
};

export default function SessionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [state, setState] = useState<SessionState>("precheck");
  const [consent, setConsent] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    fetch(`/api/sessions/${params.id}`)
      .then((r) => parseApiResponse<SessionData>(r))
      .then(setSession)
      .catch(() => setSession(null));
  }, [params.id]);

  useEffect(() => {
    if (state !== "live") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [state]);

  const endSession = useCallback(async () => {
    setState("ending");
    await fetch(`/api/sessions/${params.id}/end`, { method: "POST" });
    await fetch(`/api/sessions/${params.id}/sync-messages`, { method: "POST" });
    const evalRes = await fetch(`/api/sessions/${params.id}/evaluate`, {
      method: "POST",
    });
    const evalData = await parseApiResponse<{ reportId?: string }>(evalRes);
    if (evalRes.ok && evalData.reportId) {
      router.push(`/reports/${evalData.reportId}`);
      return;
    }
    const poll = setInterval(async () => {
      const res = await fetch(`/api/sessions/${params.id}`);
      const data = await parseApiResponse<{ status?: string; reportId?: string }>(
        res
      );
      if (data.status === "report_ready" && data.reportId) {
        clearInterval(poll);
        router.push(`/reports/${data.reportId}`);
      }
    }, 5000);
  }, [params.id, router]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const hasLiveKit =
    session?.join_url &&
    session.join_url !== "about:blank" &&
    session.livekit_token;

  return (
    <>
      <PageHeader
        title={session?.target_profiles?.name ?? "Session"}
        description={session?.scenarios?.title ?? "Rehearsal"}
      />

      {state === "precheck" && (
        <Card className="max-w-lg">
          <CardContent className="space-y-4 pt-6">
            <p className="text-sm text-muted-foreground">
              This is a <strong className="text-foreground">voice + video</strong>{" "}
              rehearsal. Allow camera and microphone. Use the{" "}
              <strong className="text-foreground">chat panel</strong> on the right
              during the call (or the Chat button on mobile). Click{" "}
              <strong className="text-foreground">Enable audio</strong> if you
              cannot hear the avatar.
            </p>
            {!hasLiveKit && session?.join_url && session.join_url !== "about:blank" && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                This session is missing a connection token. Start a new rehearsal
                from Scenarios (sessions created before the LiveKit fix need to be
                recreated).
              </p>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I consent to transcript capture for this rehearsal
            </label>
            <Button disabled={!consent || !hasLiveKit} onClick={() => setState("live")}>
              Start session
            </Button>
          </CardContent>
        </Card>
      )}

      {state === "live" && (
        <div className="space-y-4">
          <div className="flex h-[min(780px,calc(100vh-10rem))] w-full max-w-7xl flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
            {hasLiveKit ? (
              <LiveAvatarRoom
                sessionId={params.id}
                serverUrl={session.join_url!}
                token={session.livekit_token!}
                elapsedLabel={`${mm}:${ss}`}
              />
            ) : (
              <p className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                Demo mode: Beyond Presence not configured. Have your conversation,
                then end session to generate a mock report.
              </p>
            )}
          </div>
          <div className="flex max-w-7xl justify-end">
            <Button variant="destructive" onClick={endSession}>
              End session
            </Button>
          </div>
        </div>
      )}

      {state === "ending" && (
        <p className="text-muted-foreground">Generating your report…</p>
      )}
    </>
  );
}
