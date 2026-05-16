/**
 * Quick API health check (no auth).
 * Usage: npm run smoke:health
 */
const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

async function main() {
  const res = await fetch(`${base}/api/health`);
  const body = await res.json();
  console.log(`GET /api/health → ${res.status}`, body);
  if (!res.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
