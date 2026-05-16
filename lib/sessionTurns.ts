import { getCallMessages } from "@/lib/beyondPresence";
import { createServiceSupabaseClient } from "@/lib/db";
import type { Session } from "@/types";

export async function syncSessionTurns(sessionId: string): Promise<number> {
  const supabase = createServiceSupabaseClient();

  const { data: session, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error || !session) throw new Error("Session not found");

  const typedSession = session as Session;
  if (!typedSession.bey_call_id) {
    throw new Error("Session has no Beyond Presence call ID");
  }

  const messages = await getCallMessages(typedSession.bey_call_id);

  await supabase.from("session_turns").delete().eq("session_id", sessionId);

  if (messages.length === 0) return 0;

  const rows = messages.map((msg, index) => ({
    session_id: sessionId,
    speaker: msg.role === "user" ? "user" : "avatar",
    message: msg.content,
    sent_at: msg.created_at ?? new Date().toISOString(),
    sequence: index + 1,
  }));

  const { error: insertError } = await supabase
    .from("session_turns")
    .insert(rows);

  if (insertError) throw insertError;

  return rows.length;
}

export function formatTranscript(
  turns: { speaker: string; message: string; sequence: number }[]
): string {
  return turns
    .sort((a, b) => a.sequence - b.sequence)
    .map((t) => {
      const label = t.speaker === "user" ? "USER" : "AVATAR";
      const minutes = Math.floor((t.sequence - 1) * 0.5);
      const seconds = ((t.sequence - 1) * 30) % 60;
      const timestamp = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      return `[${timestamp}] ${label}: ${t.message}`;
    })
    .join("\n");
}
