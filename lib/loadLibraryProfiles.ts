import { readFile, readdir } from "fs/promises";
import path from "path";
import { LibraryProfileSchema } from "@/lib/schemas";
import type { Domain, LibraryCategory, LibraryProfile } from "@/types";

export async function loadLibraryFromFiles(): Promise<LibraryProfile[]> {
  const libraryDir = path.join(process.cwd(), "public", "library");
  const files = (await readdir(libraryDir)).filter((f) => f.endsWith(".json"));
  const profiles: LibraryProfile[] = [];

  for (const file of files) {
    const raw = await readFile(path.join(libraryDir, file), "utf-8");
    const parsed = LibraryProfileSchema.parse(JSON.parse(raw));
    profiles.push({
      id: parsed.id,
      name: parsed.name,
      title: parsed.title ?? null,
      company: parsed.company ?? null,
      domain: parsed.domain as Domain,
      category: parsed.category as LibraryCategory,
      tags: parsed.tags,
      profile_json: parsed.profile_json,
      avatar_brief_template: parsed.avatar_brief_template,
      source_urls: parsed.source_urls,
      usage_count: 0,
      accuracy_rating: null,
      is_featured: parsed.is_featured ?? false,
      submitted_by: null,
      moderation_status: "approved",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return profiles;
}

export function filterLibraryProfiles(
  profiles: LibraryProfile[],
  params: {
    category?: LibraryCategory | null;
    domain?: Domain | null;
    search?: string | null;
    featured?: boolean;
    sort?: string;
  }
): LibraryProfile[] {
  let list = [...profiles];

  if (params.category) {
    list = list.filter((p) => p.category === params.category);
  }
  if (params.domain) {
    list = list.filter((p) => p.domain === params.domain);
  }
  if (params.featured) {
    list = list.filter((p) => p.is_featured);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  switch (params.sort) {
    case "highest_rated":
      list.sort(
        (a, b) => (b.accuracy_rating ?? 0) - (a.accuracy_rating ?? 0)
      );
      break;
    case "newest":
      list.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      break;
    case "most_used":
    default:
      list.sort((a, b) => b.usage_count - a.usage_count);
  }

  return list;
}
