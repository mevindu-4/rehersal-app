import { requireAuth, requireOwner } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

type RouteContext = { params: { id: string } };

export async function DELETE(_request: Request, { params }: RouteContext) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

  const supabase = createServiceSupabaseClient();
  const { data: doc } = await supabase
    .from("user_documents")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", auth.session.organization.id)
    .eq("is_company_shared", true)
    .maybeSingle();

  if (!doc) return jsonError("Document not found", 404);

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
