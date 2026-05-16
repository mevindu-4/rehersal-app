import { readFile } from "fs/promises";
import path from "path";
import { getApiContext } from "@/lib/api-auth";
import { jsonError, jsonOk, unauthorized } from "@/lib/api-response";
import { createServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getApiContext();
  if (!ctx) return unauthorized();

  const supabase = createServiceClient();

  const { data: lib } = await supabase
    .from("public_figure_library")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  let personality = lib?.profile_json;
  let name = lib?.name as string;
  let title = lib?.title;
  let company = lib?.company;
  let domain = lib?.domain;

  if (!lib) {
    const filePath = path.join(
      process.cwd(),
      "public",
      "library",
      `${params.id}.json`
    );
    try {
      const raw = await readFile(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      personality = parsed.personality;
      name = parsed.name;
      title = parsed.title;
      company = parsed.company;
      domain = parsed.domain;
    } catch {
      return jsonError("Library profile not found", 404);
    }
  }

  const { data, error } = await supabase
    .from("target_profiles")
    .insert({
      org_id: ctx.orgId,
      created_by: ctx.userId,
      name: name ?? "Cloned profile",
      title: title ?? null,
      company: company ?? null,
      domain: domain ?? null,
      personality_json: personality,
      reconstruction_status: "complete",
      is_library: true,
    })
    .select()
    .single();

  if (error) return jsonError(error.message, 500);
  return jsonOk(data, 201);
}
