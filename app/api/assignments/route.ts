import { requireAuth, requireCoach } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { scenarioBelongsToOrg } from "@/lib/api/org";
import { syncOverdueAssignments } from "@/lib/assignments";
import { createServiceSupabaseClient } from "@/lib/db";
import { CreateAssignmentSchema } from "@/lib/schemas";

export async function GET() {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  try {
    await syncOverdueAssignments(auth.session.organization.id);
  } catch {
    /* non-fatal */
  }

  const supabase = createServiceSupabaseClient();
  const isCoach =
    auth.session.membership.role === "owner" ||
    auth.session.membership.role === "coach";

  let query = supabase
    .from("assignments")
    .select("*")
    .eq("org_id", auth.session.organization.id)
    .order("created_at", { ascending: false });

  if (!isCoach) {
    query = query.eq("learner_id", auth.session.user.id);
  }

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);

  return jsonOk({ assignments: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const forbidden = requireCoach(auth.session);
  if (forbidden) return forbidden;

  const parsed = await parseJsonBody(request, CreateAssignmentSchema);
  if ("error" in parsed) return parsed.error;

  const belongs = await scenarioBelongsToOrg(
    parsed.data.scenario_id,
    auth.session.organization.id
  );
  if (!belongs) return jsonError("Scenario not found", 404);

  const supabase = createServiceSupabaseClient();
  const rows = parsed.data.learner_ids.map((learner_id) => ({
    org_id: auth.session.organization.id,
    coach_id: auth.session.user.id,
    learner_id,
    scenario_id: parsed.data.scenario_id,
    due_date: parsed.data.due_date ?? null,
    message: parsed.data.message ?? null,
    status: "pending" as const,
  }));

  const { data, error } = await supabase
    .from("assignments")
    .insert(rows)
    .select();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to create assignments", 500);
  }

  return jsonOk({ assignments: data }, 201);
}
