import type { BeyMessage } from "@/lib/beyondPresence";

export type TranscriptMessage = {
  id: string;
  sender: "user" | "avatar";
  message: string;
  sent_at: string;
};

export type SessionTurnRow = {
  id: string;
  speaker: string;
  message: string;
  sent_at: string;
};

export function normalizeSender(sender: string): "user" | "avatar" {
  const s = sender.toLowerCase();
  if (s === "user") return "user";
  if (s === "ai" || s === "avatar" || s.includes("agent")) return "avatar";
  return "avatar";
}

function messageKey(sender: string, message: string) {
  return `${sender}:${message.trim().toLowerCase()}`;
}

/** Merge Beyond Presence transcript with locally stored typed turns. */
export function mergeTranscriptMessages(
  beyMessages: BeyMessage[],
  localTurns: SessionTurnRow[]
): TranscriptMessage[] {
  const merged: TranscriptMessage[] = beyMessages.map((m) => ({
    id: `bey-${m.sent_at}-${normalizeSender(m.sender)}`,
    sender: normalizeSender(m.sender),
    message: m.message,
    sent_at: m.sent_at,
  }));

  for (const turn of localTurns) {
    const sender = normalizeSender(turn.speaker);
    const key = messageKey(sender, turn.message);
    const duplicate = merged.some((m) => {
      if (messageKey(m.sender, m.message) !== key) return false;
      const dt = Math.abs(
        new Date(m.sent_at).getTime() - new Date(turn.sent_at).getTime()
      );
      return dt < 120_000;
    });
    if (!duplicate) {
      merged.push({
        id: turn.id,
        sender,
        message: turn.message,
        sent_at: turn.sent_at,
      });
    }
  }

  merged.sort(
    (a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime()
  );
  return merged;
}
