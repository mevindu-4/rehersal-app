/**
 * Run backend checks that do NOT require OpenAI.
 * Usage: npm run backend:ready
 */
import { execSync } from "child_process";

const steps: { name: string; cmd: string }[] = [
  { name: "Environment", cmd: "npm run setup:check" },
  { name: "Supabase", cmd: "npm run verify:supabase" },
  { name: "Library seed", cmd: "npm run seed:library" },
  { name: "Beyond Presence", cmd: "npm run test:bp" },
];

async function main() {
  console.log("Rehearsal — backend readiness (no OpenAI required)\n");

  let failed = 0;
  for (const step of steps) {
    console.log(`▶ ${step.name}…`);
    try {
      execSync(step.cmd, { stdio: "inherit", env: process.env });
      console.log(`  ✓ ${step.name}\n`);
    } catch {
      console.log(`  ✗ ${step.name}\n`);
      failed++;
    }
  }

  console.log("---");
  if (failed === 0) {
    console.log("Backend ready (without AI features).");
    console.log("Add OPENAI_API_KEY later for reconstruct / embed / evaluate.");
  } else {
    console.log(`${failed} step(s) failed. See docs/BACKEND_STATUS.md`);
    process.exit(1);
  }
}

main();
