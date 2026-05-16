import { getApiContext } from "@/lib/api-auth";
import { getCallMessages } from "@/lib/beyondPresence";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import {
  mergeTranscriptMessages,
  normalizeSender,
  type TranscriptMessage,
} from "@/lib/session-transcript";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function loadLocalTurns(sessionId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("session_turns")
    .select("id, speaker, message, sent_at")
    .eq("session_id", sessionId)
    .order("sent_at", { ascending: true });
  return data ?? [];
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("bey_call_id")
    .eq("id", params.id)
    .eq("user_id", ctx.userId)
    .single();

  if (!session) return jsonError("Session not found", 404);

  const localTurns = await loadLocalTurns(params.id);

  if (!session.bey_call_id) {
    return jsonOk(
      localTurns.map((t) => ({
        id: t.id,
        sender: normalizeSender(t.speaker),
        message: t.message,
        sent_at: t.sent_at,
      }))
    );
  }

  try {
    const beyMessages = await getCallMessages(session.bey_call_id as string);
    return jsonOk(mergeTranscriptMessages(beyMessages, localTurns));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load messages";
    return jsonError(message, 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  let body: { message?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const text = body.message?.trim();
  if (!text) return jsonError("message is required", 400);

  const supabase = createServiceClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", params.id)
    .eq("user_id", ctx.userId)
    .single();

  if (!session) return jsonError("Session not found", 404);

  const { data: lastTurn } = await supabase
    .from("session_turns")
    .select("sequence")
    .eq("session_id", params.id)
    .order("sequence", { ascending: false })
    .limit(1)
    .maybeSingle();

  const sequence = (lastTurn?.sequence ?? 0) + 1;
  const sentAt = new Date().toISOString();

  const { data: row, error } = await supabase
    .from("session_turns")
    .insert({
      session_id: params.id,
      speaker: "user",
      message: text,
      sent_at: sentAt,
      sequence,
    })
    .select("id, speaker, message, sent_at")
    .single();

  if (error || !row) {
    return jsonError(error?.message ?? "Failed to save message", 500);
  }

  const saved: TranscriptMessage = {
    id: row.id,
    sender: "user",
    message: row.message,
    sent_at: row.sent_at,
  };

  return jsonOk(saved);
}
