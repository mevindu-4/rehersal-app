import { requireAuth, requireOwner } from "@/lib/api/auth";
import { jsonError } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";

/** Export workspace data as JSON — owner only. No OpenAI required. */
export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireOwner(auth.session);
  if (forbidden) return forbidden;

  const orgId = auth.session.organization.id;
  const supabase = createServiceSupabaseClient();

  const [
    targets,
    scenarios,
    documents,
    sessions,
    assignments,
    memberships,
  ] = await Promise.all([
    supabase.from("target_profiles").select("*").eq("org_id", orgId),
    supabase.from("scenarios").select("*").eq("org_id", orgId),
    supabase.from("user_documents").select("*").eq("org_id", orgId),
    supabase.from("sessions").select("*").eq("org_id", orgId),
    supabase.from("assignments").select("*").eq("org_id", orgId),
    supabase.from("memberships").select("*").eq("org_id", orgId),
  ]);

  const firstError =
    targets.error ??
    scenarios.error ??
    documents.error ??
    sessions.error ??
    assignments.error ??
    memberships.error;

  if (firstError) return jsonError(firstError.message, 500);

  const payload = {
    exported_at: new Date().toISOString(),
    organization: auth.session.organization,
    targets: targets.data ?? [],
    scenarios: scenarios.data ?? [],
    documents: documents.data ?? [],
    sessions: sessions.data ?? [],
    assignments: assignments.data ?? [],
    memberships: memberships.data ?? [],
  };

  const filename = `rehearsal-export-${auth.session.organization.slug}-${Date.now()}.json`;

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
