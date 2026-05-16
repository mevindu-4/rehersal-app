import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createTargetSchema } from "@/lib/schemas";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("target_profiles")
    .select("*")
    .eq("org_id", ctx.orgId)
    .order("updated_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function POST(request: Request) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const body = await request.json();
  const parsed = createTargetSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("target_profiles")
    .insert({
      org_id: ctx.orgId,
      created_by: ctx.userId,
      name: parsed.data.name,
      title: parsed.data.title ?? null,
      company: parsed.data.company ?? null,
      domain: parsed.data.domain ?? null,
      reconstruction_status: "pending",
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
