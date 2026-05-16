"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useRoomContext } from "@livekit/components-react";
import { ConnectionState, type Room } from "livekit-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  apiErrorMessage,
  parseApiResponse,
} from "@/lib/parse-api-response";
import { cn } from "@/lib/utils";

type TranscriptMessage = {
  id: string;
  sender: "user" | "avatar";
  message: string;
  sent_at: string;
  pending?: boolean;
};

type Props = {
  sessionId: string;
  className?: string;
  onClose?: () => void;
};

function findAgentIdentity(room: Room): string | null {
  for (const p of Array.from(room.remoteParticipants.values())) {
    const id = p.identity.toLowerCase();
    if (id.startsWith("agent") || id.includes("avatar")) {
      return p.identity;
    }
  }
  const first = room.remoteParticipants.values().next().value;
  return first?.identity ?? null;
}

function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function SessionChatPanel({ sessionId, className, onClose }: Props) {
  const room = useRoomContext();
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const connected = room.state === ConnectionState.Connected;
  const agentIdentity = connected ? findAgentIdentity(room) : null;

  const fetchTranscript = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      const data = await parseApiResponse<TranscriptMessage[]>(res);
      if (!res.ok) return;

      setMessages((prev) => {
        const inFlight = prev.filter((m) => m.pending);
        const merged = [...data];
        for (const p of inFlight) {
          const duplicate = merged.some(
            (m) =>
              m.sender === "user" &&
              m.message.trim().toLowerCase() === p.message.trim().toLowerCase()
          );
          if (!duplicate) merged.push(p);
        }
        merged.sort(
          (a, b) =>
            new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
        );
        return merged;
      });
    } catch {
      /* ignore poll errors */
    }
  }, [sessionId]);

  useEffect(() => {
    const t = setInterval(() => {
      setMessages((prev) => {
        const now = Date.now();
        let changed = false;
        const next = prev.map((m) => {
          if (!m.pending) return m;
          if (now - new Date(m.sent_at).getTime() > 12_000) {
            changed = true;
            return { ...m, pending: false };
          }
          return m;
        });
        return changed ? next : prev;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!connected) return;
    fetchTranscript();
    const t = setInterval(fetchTranscript, 2500);
    return () => clearInterval(t);
  }, [connected, fetchTranscript]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setSendError(null);

    const optimistic: TranscriptMessage = {
      id: `pending-${Date.now()}`,
      sender: "user",
      message: text,
      sent_at: new Date().toISOString(),
      pending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const saveRes = await fetch(`/api/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const saved = await parseApiResponse<TranscriptMessage & { error?: string }>(
        saveRes
      );
      if (!saveRes.ok) {
        throw new Error(apiErrorMessage(saved, "Could not save message"));
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === optimistic.id ? { ...saved, pending: false } : m
        )
      );

      let livekitNote: string | null = null;
      const destinations = agentIdentity ? [agentIdentity] : undefined;

      try {
        await room.localParticipant.sendText(text, {
          topic: "lk.chat",
          destinationIdentities: destinations,
        });

        try {
          const legacy = new TextEncoder().encode(
            JSON.stringify({
              id: crypto.randomUUID(),
              message: text,
              timestamp: Date.now(),
            })
          );
          await room.localParticipant.publishData(legacy, {
            reliable: true,
            topic: "lk-chat-topic",
            destinationIdentities: destinations,
          });
        } catch {
          /* legacy channel optional */
        }
      } catch {
        livekitNote =
          "Saved to transcript. Use your microphone if the interviewer doesn't reply to text.";
      }

      if (!agentIdentity && connected) {
        livekitNote =
          livekitNote ??
          "Saved to transcript. Waiting for interviewer to join for live delivery.";
      }

      setSendError(livekitNote);
      void fetchTranscript();
    } catch (err) {
      setSendError(
        err instanceof Error
          ? err.message
          : "Message not sent. Use your microphone to speak to the agent."
      );
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col border-border bg-card/95 backdrop-blur-md md:w-[340px] md:shrink-0 md:border-l lg:w-[380px]",
        className
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold tracking-tight">Transcript</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Voice and typed messages sync here
          </p>
        </div>
        <span
          className={cn(
            "mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
            connected
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-muted text-muted-foreground"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              connected ? "bg-emerald-400" : "bg-muted-foreground"
            )}
          />
          {connected ? "Live" : "Connecting"}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Close
          </button>
        )}
      </header>

      <div
        ref={listRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              {connected
                ? "Say hello or send a message below."
                : "Connecting to session…"}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <li
                  key={msg.id}
                  className={cn("flex", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "rounded-br-md bg-primary/15 text-foreground ring-1 ring-primary/25"
                        : "rounded-bl-md bg-muted/80 text-foreground ring-1 ring-border/60",
                      msg.pending && "opacity-60"
                    )}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      <span>{isUser ? "You" : "Interviewer"}</span>
                      <span className="opacity-50">·</span>
                      <time dateTime={msg.sent_at}>
                        {msg.pending ? "Sending…" : formatTime(msg.sent_at)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="shrink-0 border-t border-border bg-muted/20 p-3">
        <form onSubmit={handleSend} className="space-y-2">
          <div className="overflow-hidden rounded-xl border border-input bg-background shadow-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring/50">
            <Textarea
              ref={inputRef}
              id="session-chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                connected
                  ? "Message the interviewer…"
                  : "Waiting for connection…"
              }
              rows={2}
              disabled={sending || !connected}
              className="min-h-[52px] resize-none border-0 bg-transparent px-3 py-2.5 text-sm shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center justify-between gap-2 border-t border-border/60 px-2 py-1.5">
              <span className="px-1 text-[11px] text-muted-foreground">
                Enter to send · Shift+Enter for new line
              </span>
              <Button
                type="submit"
                size="sm"
                className="h-8 gap-1.5 px-3"
                disabled={sending || !connected || !draft.trim()}
              >
                {sending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send
              </Button>
            </div>
          </div>
          {sendError && (
            <p
              className={cn(
                "text-xs",
                sendError.includes("Saved") || sendError.includes("microphone")
                  ? "text-amber-500/90"
                  : "text-destructive"
              )}
              role="status"
            >
              {sendError}
            </p>
          )}
          {!agentIdentity && connected && (
            <p className="text-xs text-amber-500/90">
              Interviewer is still joining…
            </p>
          )}
        </form>
      </footer>
    </aside>
  );
}
