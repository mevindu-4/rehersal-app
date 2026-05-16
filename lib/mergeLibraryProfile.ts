import type { LibraryProfile } from "@/types";

/** Merge DB row with canonical file profile (fills category, is_featured, etc.). */
export function mergeLibraryProfile(
  dbRow: Record<string, unknown>,
  fileProfile: LibraryProfile
): LibraryProfile {
  return {
    ...fileProfile,
    ...dbRow,
    id: String(dbRow.id ?? fileProfile.id),
    name: String(dbRow.name ?? fileProfile.name),
    title: (dbRow.title as string | null) ?? fileProfile.title,
    company: (dbRow.company as string | null) ?? fileProfile.company,
    domain: (dbRow.domain as LibraryProfile["domain"]) ?? fileProfile.domain,
    category:
      (dbRow.category as LibraryProfile["category"]) ?? fileProfile.category,
    tags: (dbRow.tags as string[]) ?? fileProfile.tags,
    profile_json:
      (dbRow.profile_json as LibraryProfile["profile_json"]) ??
      fileProfile.profile_json,
    avatar_brief_template:
      String(dbRow.avatar_brief_template ?? fileProfile.avatar_brief_template),
    source_urls:
      (dbRow.source_urls as string[]) ?? fileProfile.source_urls,
    usage_count:
      typeof dbRow.usage_count === "number"
        ? dbRow.usage_count
        : fileProfile.usage_count,
    accuracy_rating:
      (dbRow.accuracy_rating as number | null) ?? fileProfile.accuracy_rating,
    is_featured:
      typeof dbRow.is_featured === "boolean"
        ? dbRow.is_featured
        : fileProfile.is_featured,
    submitted_by:
      (dbRow.submitted_by as string | null) ?? fileProfile.submitted_by,
    moderation_status:
      (dbRow.moderation_status as LibraryProfile["moderation_status"]) ??
      fileProfile.moderation_status,
    created_at: String(dbRow.created_at ?? fileProfile.created_at),
    updated_at: String(dbRow.updated_at ?? fileProfile.updated_at),
  };
}
