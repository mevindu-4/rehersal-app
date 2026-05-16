/**
 * Create Supabase Storage buckets required by the app.
 * Usage: npm run storage:setup
 */
import { createAdminClient } from "../lib/supabaseAdmin";

const BUCKETS = [
  { name: "documents", public: false },
  { name: "reports", public: false },
];

async function main() {
  const supabase = createAdminClient();

  for (const bucket of BUCKETS) {
    const { data: existing } = await supabase.storage.getBucket(bucket.name);

    if (existing) {
      console.log(`✓ bucket "${bucket.name}" already exists`);
      continue;
    }

    const { error } = await supabase.storage.createBucket(bucket.name, {
      public: bucket.public,
      fileSizeLimit: bucket.name === "documents" ? 20 * 1024 * 1024 : 10 * 1024 * 1024,
    });

    if (error) {
      console.error(`✗ bucket "${bucket.name}":`, error.message);
    } else {
      console.log(`✓ created bucket "${bucket.name}"`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
