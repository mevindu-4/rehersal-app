import type { BeyCall, BeyMessage } from "@/types";

const BP_BASE_URL = "https://api.bey.dev/v1";
const BEY_CHAT_BASE = "https://bey.chat";

function getApiKey(): string {
  const key = process.env.BEY_API_KEY;
  if (!key) throw new Error("Missing BEY_API_KEY");
  return key;
}

function getAgentId(): string {
  const id = process.env.BEY_AGENT_ID;
  if (!id) throw new Error("Missing BEY_AGENT_ID");
  return id;
}

async function bpFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BP_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getApiKey(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Beyond Presence API error ${res.status}: ${body}`);
  }

  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export interface CreateCallParams {
  agentId?: string;
  userName: string;
  /** Applied via PATCH /agents/{id} before the call (JIT context). */
  systemPromptOverride?: string;
  /** Key-value tags (max 10), e.g. { session_id: "uuid", source: "rehearsal" }. */
  tags?: Record<string, string>;
}

export async function createCall(params: CreateCallParams): Promise<BeyCall> {
  const agentId = params.agentId ?? getAgentId();

  if (params.systemPromptOverride) {
    await updateAgent(agentId, params.systemPromptOverride);
  }

  const data = await bpFetch<{
    id: string;
    agent_id: string;
    livekit_url: string;
    livekit_token: string;
  }>("/calls", {
    method: "POST",
    body: JSON.stringify({
      agent_id: agentId,
      livekit_username: params.userName,
      tags: params.tags ?? { source: "rehearsal" },
    }),
  });

  return {
    id: data.id,
    agent_id: data.agent_id ?? agentId,
    join_url: `${BEY_CHAT_BASE}/${agentId}`,
    livekit_url: data.livekit_url,
    livekit_token: data.livekit_token,
  };
}

export async function getCallMessages(callId: string): Promise<BeyMessage[]> {
  const data = await bpFetch<{ messages: BeyMessage[] }>(
    `/calls/${callId}/messages`
  );
  return data.messages ?? [];
}

export async function endCall(callId: string): Promise<void> {
  await bpFetch<Record<string, never>>(`/calls/${callId}/end`, {
    method: "POST",
  });
}

export async function updateAgent(
  agentId: string,
  systemPrompt: string
): Promise<void> {
  await bpFetch(`/agents/${agentId}`, {
    method: "PATCH",
    body: JSON.stringify({ system_prompt: systemPrompt }),
  });
}
