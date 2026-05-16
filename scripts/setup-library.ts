/**
 * Validate JSON, optionally enrich metadata, verify Supabase, seed when possible.
 * Usage: npm run setup:library
 */
import { execSync } from "child_process";

function run(cmd: string) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd: process.cwd() });
}

async function main() {
  run("npm run validate:library");

  try {
    run("npm run verify:supabase");
  } catch {
    console.warn("\nSupabase verify had warnings — continuing.\n");
  }

  try {
    run("npm run seed:library");
  } catch {
    console.warn(
      "\nSeed skipped or failed. Library API still serves public/library/*.json\n"
    );
  }

  run("npm run test:prompts");
  console.log("\nLibrary setup complete.");
}

main();
