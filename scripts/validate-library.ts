/**
 * Validates all public/library/*.json files against LibraryProfileSchema.
 * Usage: npx tsx scripts/validate-library.ts
 */
import { readdir, readFile } from "fs/promises";
import path from "path";
import { LibraryProfileSchema } from "../lib/schemas";

async function main() {
  const libraryDir = path.join(process.cwd(), "public", "library");
  const files = (await readdir(libraryDir)).filter((f) => f.endsWith(".json"));
  let featured = 0;
  const errors: string[] = [];

  for (const file of files) {
    try {
      const raw = JSON.parse(
        await readFile(path.join(libraryDir, file), "utf-8")
      );
      const parsed = LibraryProfileSchema.parse(raw);
      if (parsed.is_featured) featured++;

      const confKeys = Object.keys(parsed.profile_json.confidence ?? {}).length;
      const citKeys = Object.keys(
        parsed.profile_json.source_citations ?? {}
      ).length;
      if (confKeys === 0 || citKeys === 0) {
        console.warn(
          `  warn ${file}: missing profile_json.confidence or source_citations metadata`
        );
      }
      console.log(`  ok  ${file}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${file}: ${msg}`);
      console.error(`  FAIL ${file}: ${msg}`);
    }
  }

  console.log(`\n${files.length} file(s), ${featured} featured (max 3 recommended)`);
  if (featured > 3) {
    errors.push(`Too many featured profiles: ${featured} (max 3)`);
  }

  if (errors.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
