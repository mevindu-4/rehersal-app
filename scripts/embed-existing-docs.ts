/**
 * Re-embed all pending/failed documents for an org.
 * Usage: npx tsx scripts/embed-existing-docs.ts [org_id]
 */
import { embedPendingDocuments } from "../lib/embeddings";

async function main() {
  const orgId = process.argv[2];
  const count = await embedPendingDocuments(orgId);
  console.log(`Embedded ${count} document(s)${orgId ? ` for org ${orgId}` : ""}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
