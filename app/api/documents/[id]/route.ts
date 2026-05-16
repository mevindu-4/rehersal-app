import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("user_documents")
    .delete()
    .eq("id", params.id)
    .eq("user_id", ctx.userId);

  if (error) return jsonError(error.message, 500);
  return jsonOk({ success: true });
}
