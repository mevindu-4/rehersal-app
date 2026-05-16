/**
 * Validate .env.local without printing secret values.
 * Usage: npm run setup:check
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ENV_PATH = resolve(process.cwd(), ".env.local");

const REQUIRED: { key: string; label: string }[] = [
  { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase project URL" },
  { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", label: "Supabase anon key" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase service role key" },
  { key: "BEY_API_KEY", label: "Beyond Presence API key" },
  { key: "BEY_AGENT_ID", label: "Beyond Presence agent ID" },
  { key: "NEXT_PUBLIC_APP_URL", label: "App URL" },
];

const RECOMMENDED: { key: string; label: string }[] = [
  { key: "OPENAI_API_KEY", label: "OpenAI API key (reconstruct, embed, evaluate)" },
  { key: "JINA_API_KEY", label: "Jina Reader API key" },
];

const OPTIONAL: string[] = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "BEY_WEBHOOK_SECRET",
  "DATABASE_URL",
  "RESEND_API_KEY",
  "RESEND_FROM_EMAIL",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "NEXT_PUBLIC_POSTHOG_HOST",
  "NEXT_PUBLIC_SENTRY_DSN",
];

function parseEnv(content: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

function main() {
  console.log("Rehearsal — environment check\n");

  if (!existsSync(ENV_PATH)) {
    console.error("Missing .env.local — copy from .env.local.example\n");
    process.exit(1);
  }

  const env = parseEnv(readFileSync(ENV_PATH, "utf-8"));
  let errors = 0;
  let warnings = 0;

  for (const { key, label } of REQUIRED) {
    const val = env[key]?.trim() ?? "";
    if (!val) {
      console.log(`  ✗ ${label} (${key}) — missing`);
      errors++;
      continue;
    }
    if (key === "NEXT_PUBLIC_SUPABASE_URL" && /\/rest\/v1/i.test(val)) {
      console.log(`  ✗ ${label} — must NOT include /rest/v1 (use project root URL)`);
      errors++;
      continue;
    }
    console.log(`  ✓ ${label}`);
  }

  for (const { key, label } of RECOMMENDED) {
    const val = env[key]?.trim() ?? "";
    if (!val) {
      console.log(`  ⚠ ${label} (${key}) — recommended, not set`);
      warnings++;
    } else {
      console.log(`  ✓ ${label}`);
    }
  }

  console.log("\nOptional:");
  for (const key of OPTIONAL) {
    const val = env[key]?.trim() ?? "";
    console.log(`  ${val ? "✓" : "○"} ${key}`);
  }

  console.log("\n---\n");
  if (errors > 0) {
    console.log(`Fix ${errors} required variable(s), then run: npm run verify:supabase`);
    process.exit(1);
  }
  if (warnings > 0) {
    console.log(`${warnings} warning(s). Core env OK.`);
  } else {
    console.log("All required and recommended variables are set.");
  }
  const googleId = env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const googleSecret = env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
  if (!googleId || !googleSecret) {
    console.log(
      "\nGoogle sign-in: enable in Supabase → Auth → Google (see docs/GOOGLE_AUTH.md)."
    );
    console.log(
      "  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.local are optional reference copies."
    );
  }

  console.log("\nNext: npm run verify:supabase && npm run dev");
}

main();
