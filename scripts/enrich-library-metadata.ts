/**
 * Adds source_citations and confidence to library profile_json when empty.
 * Usage: npx tsx scripts/enrich-library-metadata.ts
 */
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { LibraryProfileSchema } from "../lib/schemas";

const ARCHETYPE_SOURCE = "Rehearsal curated archetype";

function enrichProfileJson(
  profile: ReturnType<typeof LibraryProfileSchema.parse>["profile_json"]
) {
  const citations = { ...profile.source_citations };
  const confidence = { ...profile.confidence };

  const fields: Array<{
    key: keyof typeof profile;
    confidence: "high" | "medium" | "low";
  }> = [
    { key: "communication_style", confidence: "high" },
    { key: "core_values", confidence: "high" },
    { key: "typical_question_patterns", confidence: "high" },
    { key: "known_priorities", confidence: "high" },
    { key: "known_skepticisms", confidence: "medium" },
    { key: "what_impresses_them", confidence: "medium" },
    { key: "what_irritates_them", confidence: "medium" },
    { key: "expertise_areas", confidence: "medium" },
    { key: "behavioral_signals", confidence: "low" },
    { key: "inferred_concerns_by_context", confidence: "low" },
  ];

  for (const { key, confidence: level } of fields) {
    const value = profile[key];
    const hasContent = Array.isArray(value)
      ? value.length > 0
      : typeof value === "object" && value !== null
        ? Object.keys(value as object).length > 0
        : Boolean(value);

    if (!hasContent) continue;
    if (!citations[key as string]) {
      citations[key as string] = ARCHETYPE_SOURCE;
    }
    if (!confidence[key as string]) {
      confidence[key as string] = level;
    }
  }

  return { ...profile, source_citations: citations, confidence };
}

async function main() {
  const libraryDir = path.join(process.cwd(), "public", "library");
  const files = (await readdir(libraryDir)).filter((f) => f.endsWith(".json"));

  for (const file of files) {
    const filePath = path.join(libraryDir, file);
    const raw = JSON.parse(await readFile(filePath, "utf-8"));
    const parsed = LibraryProfileSchema.parse(raw);
    const enriched = enrichProfileJson(parsed.profile_json);
    const next = { ...parsed, profile_json: enriched };
    LibraryProfileSchema.parse(next);
    await writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, "utf-8");
    console.log(`Enriched ${file}`);
  }

  console.log(`Done. Updated ${files.length} file(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
