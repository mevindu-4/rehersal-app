/**
 * Seeds public_figure_library from public/library/*.json
 * Usage: npm run seed:library
 */
import { readdir, readFile } from "fs/promises";
import path from "path";
import { LibraryProfileSchema } from "../lib/schemas";
import {
  isLibraryDbReady,
  isLibraryDbSeedable,
} from "../lib/libraryDbReady";
import { buildLibraryUpsertRow } from "../lib/libraryRows";
import { getLibrarySchemaCapabilities } from "../lib/librarySchema";
import { createAdminClient } from "../lib/supabaseAdmin";

async function main() {
  const { columns, ready, seedable, idFormat } =
    await getLibrarySchemaCapabilities();

  if (idFormat === "uuid") {
    console.error(
      "public_figure_library.id is UUID but library JSON uses TEXT ids (lib_*).\n" +
        "Run in Supabase SQL Editor:\n" +
        "  supabase/migrations/007_009_library_complete.sql\n" +
        "Then re-run: npm run seed:library"
    );
    process.exit(1);
  }

  if (!seedable) {
    console.error(
      "public_figure_library is missing core columns (name, profile_json, avatar_brief_template).\n" +
        "Run migrations 001 and 006 in Supabase SQL Editor first."
    );
    process.exit(1);
  }

  if (!ready) {
    console.warn(
      "Partial library schema (missing category or is_featured).\n" +
        "Seeding available columns only. For filters + featured, run migration 007:\n" +
        "  npm run db:repair:007   (requires DATABASE_URL)\n" +
        "  or paste supabase/migrations/007_fix_public_figure_library.sql in SQL Editor\n"
    );
  }

  const supabase = createAdminClient();
  const libraryDir = path.join(process.cwd(), "public", "library");
  const files = (await readdir(libraryDir)).filter((f) => f.endsWith(".json"));
  let ok = 0;

  for (const file of files) {
    const raw = await readFile(path.join(libraryDir, file), "utf-8");
    const parsed = LibraryProfileSchema.parse(JSON.parse(raw));
    const row = buildLibraryUpsertRow(parsed, columns);

    const { error } = await supabase
      .from("public_figure_library")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error(`Failed to seed ${file}:`, error.message);
    } else {
      console.log(`Seeded ${parsed.id}`);
      ok++;
    }
  }

  console.log(`Done. ${ok}/${files.length} profile(s) upserted.`);
  const fullReady = await isLibraryDbReady();
  const canSeed = await isLibraryDbSeedable();
  if (!fullReady && canSeed) {
    console.log("API merges DB rows with public/library/*.json until migration 007 is applied.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
