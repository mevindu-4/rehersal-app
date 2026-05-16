import { requireAuth } from "@/lib/api/auth";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/api/http";
import { createServiceSupabaseClient } from "@/lib/db";
import { CreateTargetSchema } from "@/lib/schemas";
import type { Domain, TargetStatus } from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as TargetStatus | null;
  const domain = searchParams.get("domain") as Domain | null;

  const supabase = createServiceSupabaseClient();
  let query = supabase
    .from("target_profiles")
    .select("*")
    .eq("org_id", auth.session.organization.id)
    .order("updated_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (domain) query = query.eq("domain", domain);

  const { data, error } = await query;
  if (error) {
    return jsonError(error.message, 500);
  }

  return jsonOk({ targets: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if ("error" in auth) return auth.error;

  const parsed = await parseJsonBody(request, CreateTargetSchema);
  if ("error" in parsed) return parsed.error;

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("target_profiles")
    .insert({
      org_id: auth.session.organization.id,
      created_by: auth.session.user.id,
      name: parsed.data.name,
      title: parsed.data.title ?? null,
      company: parsed.data.company ?? null,
      domain: parsed.data.domain,
      tags: parsed.data.tags ?? [],
      status: "pending",
    })
    .select()
    .single();

  if (error || !data) {
    return jsonError(error?.message ?? "Failed to create target", 500);
  }

  return jsonOk({ target: data }, 201);
}
