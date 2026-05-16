import { LibraryProfileSchema } from "@/lib/schemas";
import type { z } from "zod";

type ParsedLibrary = z.infer<typeof LibraryProfileSchema>;

/** Build upsert row using only columns present on the remote table. */
export function buildLibraryUpsertRow(
  parsed: ParsedLibrary,
  columns: string[]
): Record<string, unknown> {
  const has = (col: string) => columns.includes(col);
  const row: Record<string, unknown> = { id: parsed.id };

  if (has("name")) row.name = parsed.name;
  if (has("title")) row.title = parsed.title ?? null;
  if (has("company")) row.company = parsed.company ?? null;
  if (has("domain")) row.domain = parsed.domain;
  if (has("category")) row.category = parsed.category;
  if (has("tags")) row.tags = parsed.tags;
  if (has("profile_json")) row.profile_json = parsed.profile_json;
  if (has("avatar_brief_template"))
    row.avatar_brief_template = parsed.avatar_brief_template;
  if (has("source_urls")) row.source_urls = parsed.source_urls;
  if (has("is_featured")) row.is_featured = parsed.is_featured ?? false;
  if (has("moderation_status")) row.moderation_status = "approved";

  return row;
}
