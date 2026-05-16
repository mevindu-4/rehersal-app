/**
 * Verify OpenAI integration (run after adding OPENAI_API_KEY).
 * Usage: npm run test:openai
 */
import { embed, isOpenAIConfigured, completionJSON } from "../lib/openai";
import { buildReconstructionPrompt } from "../lib/prompts";
import { PersonalityJSONSchema, validateAISafety } from "../lib/schemas";

const SAMPLE_SOURCES = `=== SOURCE: Manual notes ===
Alex is a direct seed VC who asks "why now" in the first five minutes.
Skeptical of large TAM slides without wedge strategy. Impressed by specific metrics.`;

async function main() {
  console.log("Rehearsal — OpenAI integration test\n");

  if (!isOpenAIConfigured()) {
    console.error("✗ OPENAI_API_KEY not set in .env.local");
    console.error("  Add the key, then run: npm run test:openai\n");
    process.exit(1);
  }

  console.log("✓ OPENAI_API_KEY present\n");

  // 1. Embeddings
  console.log("▶ Embedding (text-embedding-3-small)…");
  const vector = await embed("Rehearsal practice session goal: fundraising pitch");
  if (vector.length !== 1536) {
    throw new Error(`Expected 1536 dimensions, got ${vector.length}`);
  }
  console.log(`  ✓ Vector length ${vector.length}\n`);

  // 2. Reconstruction JSON (small sample — uses gpt-4o tokens)
  console.log("▶ Reconstruction JSON (gpt-4o, sample sources)…");
  const personality = await completionJSON(
    buildReconstructionPrompt(SAMPLE_SOURCES),
    PersonalityJSONSchema
  );
  if (!personality.communication_style?.directness) {
    throw new Error("PersonalityJSON missing communication_style");
  }
  const safety = validateAISafety(JSON.stringify(personality));
  if (!safety.safe) {
    throw new Error(`Safety check failed: ${safety.matches.join(", ")}`);
  }
  console.log(`  ✓ Personality parsed (${personality.core_values?.length ?? 0} values)`);
  console.log(`  ✓ Safety check passed\n`);

  console.log("---");
  console.log("OpenAI integration OK.");
  console.log("Next: npm run dev → test reconstruct / embed / evaluate via API.\n");
}

main().catch((err) => {
  console.error("\n✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
