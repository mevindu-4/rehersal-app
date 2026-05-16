import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk } from "@/lib/api/http";
import { getLibraryProfileById } from "@/lib/libraryApi";

type RouteContext = { params: { id: string } };

export async function GET(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const profile = await getLibraryProfileById(params.id);
  if (!profile) return jsonError("Profile not found", 404);
  return jsonOk({ profile });
}
