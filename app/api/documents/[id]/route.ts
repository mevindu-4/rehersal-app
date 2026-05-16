import { requireAuth } from "@/lib/api/auth";
import { documentBelongsToOrg } from "@/lib/api/org";
import { jsonError } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

type RouteContext = { params: { id: string } };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const belongs = await documentBelongsToOrg(
    params.id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Document not found", 404);

  const supabase = createServiceSupabaseClient();
  await supabase
    .from("document_chunks")
    .delete()
    .eq("user_document_id", params.id);

  const { error } = await supabase
    .from("user_documents")
    .delete()
    .eq("id", params.id);

  if (error) return jsonError(error.message, 500);

  return new Response(null, { status: 204 });
}
