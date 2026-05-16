import { createServiceSupabaseClient } from "@/lib/db";

/** Mark pending assignments past due_date as overdue. */
export async function syncOverdueAssignments(orgId: string): Promise<number> {
  const supabase = createServiceSupabaseClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("assignments")
    .update({ status: "overdue" })
    .eq("org_id", orgId)
    .eq("status", "pending")
    .lt("due_date", now)
    .not("due_date", "is", null)
    .select("id");

  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}
