export type BeyCall = {
  id: string;
  livekit_url: string;
  livekit_token?: string;
  started_at?: string;
};

export type BeyMessage = {
  sender: string;
  message: string;
  sent_at: string;
};

export class BeyondPresenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BeyondPresenceError";
  }
}

const MOCK_MODE = !process.env.BEY_API_KEY;

export function getConfiguredAgentId(): string {
  const id = process.env.BEY_AGENT_ID?.trim();
  if (!id) {
    throw new BeyondPresenceError(
      "BEY_AGENT_ID is missing in .env.local. Create an agent at beyondpresence.com and paste its ID."
    );
  }
  return id;
}

export type BeyAgentSummary = { id: string; name: string; avatar_id: string };

export async function listAgents(): Promise<BeyAgentSummary[]> {
  if (MOCK_MODE) return [];

  const res = await fetch("https://api.bey.dev/v1/agents?limit=50", {
    headers: { "x-api-key": process.env.BEY_API_KEY! },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new BeyondPresenceError(`listAgents failed: ${text}`);
  }

  const json = await res.json();
  const rows = (json.data ?? []) as BeyAgentSummary[];
  return rows.map((a) => ({
    id: a.id,
    name: a.name,
    avatar_id: a.avatar_id,
  }));
}

export async function createCall(params: {
  agentId: string;
  userName: string;
  /** Beyond Presence expects tags as a string dictionary, not an array. */
  tags?: Record<string, string>;
  systemPrompt?: string;
}): Promise<BeyCall> {
  if (MOCK_MODE) {
    return {
      id: `mock-${Date.now()}`,
      livekit_url: "about:blank",
      started_at: new Date().toISOString(),
    };
  }

  const res = await fetch("https://api.bey.dev/v1/calls", {
    method: "POST",
    headers: {
      "x-api-key": process.env.BEY_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agent_id: params.agentId,
      livekit_username: params.userName,
      ...(params.tags && Object.keys(params.tags).length > 0
        ? { tags: params.tags }
        : {}),
      ...(params.systemPrompt
        ? { context: { system_prompt: params.systemPrompt } }
        : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    const hint = text.includes("Agent not found")
      ? " Your BEY_AGENT_ID must belong to the same Beyond Presence account as BEY_API_KEY. Open GET /api/bey/agents in the browser to see valid agent IDs."
      : "";
    throw new BeyondPresenceError(`createCall failed: ${text}${hint}`);
  }

  const data = await res.json();
  if (!data.livekit_token) {
    throw new BeyondPresenceError(
      "createCall succeeded but no livekit_token was returned. Start a new session."
    );
  }
  return {
    id: data.id,
    livekit_url: data.livekit_url ?? data.join_url,
    livekit_token: data.livekit_token,
    started_at: data.started_at,
  };
}

/** Hosted Beyond Presence UI (generic agent; not per-call API context). */
export function buildBeyChatEmbedUrl(agentId: string): string {
  return `https://bey.chat/${agentId}`;
}

export async function getCallMessages(callId: string): Promise<BeyMessage[]> {
  if (MOCK_MODE || callId.startsWith("mock-")) {
    return getMockTranscript();
  }

  const res = await fetch(`https://api.bey.dev/v1/calls/${callId}/messages`, {
    headers: { "x-api-key": process.env.BEY_API_KEY! },
  });

  if (!res.ok) {
    throw new BeyondPresenceError(`getCallMessages failed: ${res.status}`);
  }

  const data = await res.json();
  const messages = Array.isArray(data) ? data : data.messages ?? [];
  return messages.map((m: Record<string, string>) => ({
    sender: m.sender ?? m.role ?? "unknown",
    message: m.message ?? m.content ?? "",
    sent_at: m.sent_at ?? m.created_at ?? new Date().toISOString(),
  }));
}

function getMockTranscript(): BeyMessage[] {
  const t = new Date().toISOString();
  return [
    {
      sender: "avatar",
      message: "Thanks for joining. Walk me through your background in two minutes.",
      sent_at: t,
    },
    {
      sender: "user",
      message: "I led platform engineering at my last company and shipped a migration that cut deploy time significantly.",
      sent_at: t,
    },
    {
      sender: "avatar",
      message: "What metric proves that, and what broke along the way?",
      sent_at: t,
    },
    {
      sender: "user",
      message: "We reduced deploy time but I do not have the exact percentage handy.",
      sent_at: t,
    },
  ];
}
