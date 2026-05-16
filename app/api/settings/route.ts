import { requireAuth, requireOwner } from "@/lib/api/auth";
import { provisionNewUser } from "@/lib/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { UpdateSettingsSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils";

/** Update workspace settings — owner only. */
export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

  const parsed = await parseJsonBody(request, UpdateSettingsSchema);
  if ("error" in parsed) return parsed.error;

  const orgId = auth.session.organization.id;
  const slug =
    slugify(parsed.data.workspace_name).slice(0, 40) + "-" + orgId.slice(0, 8);

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.workspace_name, slug })
    .eq("id", orgId)
    .select("id, name, slug, mode")
    .single();

  if (error) return jsonError(error.message, 500);

  return jsonOk({ organization: data });
}

/** Delete workspace and provision a fresh solo org for the owner. */
export async function DELETE() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

  const orgId = auth.session.organization.id;
  const supabase = createServiceSupabaseClient();

  const { error: deleteError } = await supabase
    .from("organizations")
    .delete()
    .eq("id", orgId);

  if (deleteError) return jsonError(deleteError.message, 500);

  const { orgId: newOrgId } = await provisionNewUser({
    userId: auth.session.user.id,
    email: auth.session.user.email,
    name: auth.session.user.name ?? undefined,
    avatarUrl: auth.session.user.avatar_url ?? undefined,
    intent: "solo",
    workspaceName: "My Workspace",
  });

  return jsonOk({
    deleted: true,
    new_org_id: newOrgId,
    redirect: "/onboarding",
  });
}
