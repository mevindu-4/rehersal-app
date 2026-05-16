import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createScenarioSchema } from "@/lib/schemas";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scenarios")
    .select("*, target_profiles(name, title)")
    .eq("org_id", ctx.orgId)
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return jsonOk(data ?? []);
}

export async function POST(request: Request) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const body = await request.json();
  const parsed = createScenarioSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message);

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("scenarios")
    .insert({
      org_id: ctx.orgId,
      created_by: ctx.userId,
      title: parsed.data.title,
      conversation_type: parsed.data.conversation_type,
      duration_minutes: parsed.data.duration_minutes,
      difficulty: parsed.data.difficulty,
      goal: parsed.data.goal ?? null,
      target_profile_id: parsed.data.target_profile_id ?? null,
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
