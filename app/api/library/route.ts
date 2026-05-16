import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { listLibraryProfiles } from "@/lib/libraryApi";
import type { Domain, LibraryCategory } from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") as LibraryCategory | null;
  const domain = searchParams.get("domain") as Domain | null;
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") ?? "most_used";
  const featured = searchParams.get("featured") === "true";

  try {
    const { profiles, source } = await listLibraryProfiles({
      category,
      domain,
      search,
      sort,
      featured,
    });
    return jsonOk({ profiles, total: profiles.length, source });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "Failed to load library",
      500
    );
  }
}
