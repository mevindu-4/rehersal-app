import { getApiContext } from "@/lib/api-auth";
import { getCallMessages } from "@/lib/beyondPresence";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { mergeTranscriptMessages, normalizeSender } from "@/lib/session-transcript";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", ctx.userId)
    .single();

  if (!session?.bey_call_id) return jsonError("No call ID", 400);

  const { data: existingTurns } = await supabase
    .from("session_turns")
    .select("id, speaker, message, sent_at")
    .eq("session_id", params.id);

  const beyMessages = await getCallMessages(session.bey_call_id as string);
  const merged = mergeTranscriptMessages(beyMessages, existingTurns ?? []);

  await supabase.from("session_turns").delete().eq("session_id", params.id);

  const turns = merged.map((m, i) => ({
    session_id: params.id,
    speaker: normalizeSender(m.sender),
    message: m.message,
    sent_at: m.sent_at,
    sequence: i + 1,
  }));

  if (turns.length) {
    await supabase.from("session_turns").insert(turns);
  }

  return jsonOk({ count: turns.length });
}
