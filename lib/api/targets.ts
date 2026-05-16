import { createServiceSupabaseClient } from "@/lib/db";
import type { TargetProfile } from "@/types";

export async function getTargetForOrg(
  targetId: string,
  orgId: string
): Promise<TargetProfile | null> {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("id", targetId)
    .eq("org_id", orgId)
    .maybeSingle();

  return data as TargetProfile | null;
}

export async function incrementSourceCount(targetId: string): Promise<void> {
  const supabase = createServiceSupabaseClient();
  const { data: target } = await supabase
    .from("target_profiles")
    .select("source_count")
    .eq("id", targetId)
    .single();

  await supabase
    .from("target_profiles")
    .update({ source_count: (target?.source_count ?? 0) + 1 })
    .eq("id", targetId);
}
