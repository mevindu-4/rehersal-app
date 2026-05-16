import { listAgents } from "@/lib/beyondPresence";
import { jsonError, jsonOk } from "@/lib/api-response";

export const runtime = "nodejs";

/** Lists Beyond Presence agents for the configured API key (use to fix BEY_AGENT_ID). */
export async function GET() {
  if (!process.env.BEY_API_KEY) {
    return jsonError("BEY_API_KEY is not set in .env.local", 400);
  }

  try {
    const agents = await listAgents();
    const configured = process.env.BEY_AGENT_ID?.trim();
    return jsonOk({
      configured_agent_id: configured ?? null,
      configured_agent_found: configured
        ? agents.some((a) => a.id === configured)
        : false,
      agents,
      hint:
        "Copy an `id` from `agents` into BEY_AGENT_ID in .env.local, then restart npm run dev.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to list agents";
    return jsonError(message, 500);
  }
}
