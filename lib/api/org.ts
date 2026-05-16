import { createServiceSupabaseClient } from "@/lib/db";

export async function documentBelongsToOrg(
  documentId: string,
  orgId: string
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("user_documents")
    .select("id")
    .eq("id", documentId)
    .eq("org_id", orgId)
    .maybeSingle();

  return !!data;
}

export async function scenarioBelongsToOrg(
  scenarioId: string,
  orgId: string
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("scenarios")
    .select("id")
    .eq("id", scenarioId)
    .eq("org_id", orgId)
    .maybeSingle();

  return !!data;
}

export async function sessionBelongsToOrg(
  sessionId: string,
  orgId: string
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("org_id", orgId)
    .maybeSingle();

  return !!data;
}

export async function reportBelongsToOrg(
  reportId: string,
  orgId: string
): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const { data: report } = await supabase
    .from("feedback_reports")
    .select("session_id")
    .eq("id", reportId)
    .maybeSingle();

  if (!report) return false;

  const { data: session } = await supabase
    .from("sessions")
    .select("org_id")
    .eq("id", report.session_id)
    .maybeSingle();

  return session?.org_id === orgId;
}
