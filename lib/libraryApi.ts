import { createServiceSupabaseClient } from "@/lib/db";
import {
  filterLibraryProfiles,
  loadLibraryFromFiles,
} from "@/lib/loadLibraryProfiles";
import { isLibraryDbReady, isLibraryDbSeedable } from "@/lib/libraryDbReady";
import { mergeLibraryProfile } from "@/lib/mergeLibraryProfile";
import type { Domain, LibraryCategory, LibraryProfile } from "@/types";

export type LibraryListParams = {
  category: LibraryCategory | null;
  domain: Domain | null;
  search: string | null;
  sort: string;
  featured: boolean;
};

export async function listLibraryProfiles(
  params: LibraryListParams
): Promise<{ profiles: LibraryProfile[]; source: "db" | "files" | "db+files" }> {
  const filterParams = {
    category: params.category ?? undefined,
    domain: params.domain ?? undefined,
    search: params.search,
    featured: params.featured,
    sort: params.sort,
  };

  const fileProfiles = await loadLibraryFromFiles();
  const fileById = new Map(fileProfiles.map((p) => [p.id, p]));

  if (!(await isLibraryDbSeedable())) {
    return {
      profiles: filterLibraryProfiles(fileProfiles, filterParams),
      source: "files",
    };
  }

  const supabase = createServiceSupabaseClient();
  let query = supabase.from("public_figure_library").select("*");

  if (await isLibraryDbReady()) {
    query = query.eq("moderation_status", "approved");
    if (params.category) query = query.eq("category", params.category);
    if (params.featured) query = query.eq("is_featured", true);
  }

  if (params.domain) query = query.eq("domain", params.domain);
  if (params.search) query = query.ilike("name", `%${params.search}%`);

  switch (params.sort) {
    case "highest_rated":
      query = query.order("accuracy_rating", {
        ascending: false,
        nullsFirst: false,
      });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "most_used":
    default:
      query = query.order("usage_count", { ascending: false });
  }

  const { data, error } = await query;

  if (error || !data?.length) {
    return {
      profiles: filterLibraryProfiles(fileProfiles, filterParams),
      source: "files",
    };
  }

  const merged = data.map((row) => {
    const file = fileById.get(String(row.id));
    return file
      ? mergeLibraryProfile(row as Record<string, unknown>, file)
      : (row as LibraryProfile);
  });

  const filtered = filterLibraryProfiles(merged, filterParams);
  return {
    profiles: filtered,
    source: (await isLibraryDbReady()) ? "db" : "db+files",
  };
}

export async function getLibraryProfileById(
  id: string
): Promise<LibraryProfile | null> {
  const fileProfiles = await loadLibraryFromFiles();
  const file = fileProfiles.find((p) => p.id === id);

  if (!(await isLibraryDbSeedable())) {
    return file ?? null;
  }

  const supabase = createServiceSupabaseClient();
  let query = supabase.from("public_figure_library").select("*").eq("id", id);

  if (await isLibraryDbReady()) {
    query = query.eq("moderation_status", "approved");
  }

  const { data, error } = await query.single();

  if (error || !data) return file ?? null;
  if (file) return mergeLibraryProfile(data as Record<string, unknown>, file);
  return data as LibraryProfile;
}
