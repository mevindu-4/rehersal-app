/**
 * Verify Supabase connection and migration state.
 * Usage: npm run verify:supabase
 */
import { getLibrarySchemaCapabilities } from "../lib/librarySchema";
import { createAdminClient, getSupabaseProjectUrl } from "../lib/supabaseAdmin";

const REQUIRED_LIBRARY_COLUMNS = [
  "category",
  "is_featured",
  "profile_json",
  "avatar_brief_template",
  "domain",
  "tags",
];

async function main() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const url = getSupabaseProjectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (url !== raw.replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "")) {
    console.log("Note: use project URL only (no /rest/v1) in .env.local\n");
  }

  const supabase = createAdminClient();
  let failed = false;

  const tables = [
    "organizations",
    "users",
    "target_profiles",
    "public_figure_library",
    "document_chunks",
    "audit_logs",
  ];

  console.log("Supabase URL:", url);
  console.log("Checking tables...\n");

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      console.log(`  ✗ ${table}: ${error.message}`);
      failed = true;
    } else {
      console.log(`  ✓ ${table}`);
    }
  }

  const { columns: libraryCols, seedable, ready, idFormat } =
    await getLibrarySchemaCapabilities();

  if (idFormat === "uuid") {
    console.log("\n  ✗ public_figure_library.id is UUID — run migration 009_library_id_text.sql");
    failed = true;
  } else if (idFormat === "text") {
    console.log("\n  ✓ public_figure_library.id is TEXT (lib_* slugs)");
  }
  console.log("\nLibrary columns check:");
  for (const col of REQUIRED_LIBRARY_COLUMNS) {
    if (libraryCols.includes(col)) {
      console.log(`  ✓ ${col}`);
    } else {
      console.log(`  ✗ ${col} — run supabase/migrations/007_fix_public_figure_library.sql`);
      if (col === "category" || col === "is_featured") {
        console.log("    (partial seed still works; API merges with public/library/*.json)");
      } else {
        failed = true;
      }
    }
  }
  console.log(`\n  Library seedable: ${seedable ? "yes" : "no"}, full schema: ${ready ? "yes" : "no"}`);

  const { error: rpcError } = await supabase.rpc("match_document_chunks", {
    query_embedding: Array(1536).fill(0),
    match_count: 1,
    filter_org_id: null,
    filter_user_id: null,
    include_company: false,
  });

  if (rpcError?.message?.includes("Could not find the function")) {
    console.log("\n  ✗ match_document_chunks RPC — run migration 006");
    failed = true;
  } else if (rpcError) {
    console.log(`\n  ~ match_document_chunks: ${rpcError.message}`);
  } else {
    console.log("\n  ✓ match_document_chunks RPC");
  }

  if (failed) {
    console.log("\nFix failed checks in Supabase SQL Editor, then re-run verify.");
    process.exit(1);
  }

  if (!ready) {
    console.log(
      "\nCore checks OK. Run migration 007 for category/is_featured, then: npm run seed:library"
    );
    process.exit(0);
  }

  console.log("\nAll checks passed. Run: npm run seed:library");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
