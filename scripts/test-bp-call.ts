/**
 * Beyond Presence spike test — run before live session UI.
 * Usage: npx tsx --env-file=.env.local scripts/test-bp-call.ts
 */
import { createCall } from "../lib/beyondPresence";

async function main() {
  const call = await createCall({
    userName: "Rehearsal Spike Test",
    systemPromptOverride:
      "You are a skeptical seed-stage VC conducting a 5-minute pitch rehearsal. Ask one sharp question at a time.",
    tags: { source: "rehearsal", test: "spike" },
  });

  console.log("Beyond Presence call created:");
  console.log("  call_id:", call.id);
  console.log("  join_url (iframe):", call.join_url);
  console.log("  livekit_url:", call.livekit_url);
  console.log("  agent_id:", call.agent_id);
}

main().catch((err) => {
  console.error("BP spike test failed:", err);
  process.exit(1);
});
