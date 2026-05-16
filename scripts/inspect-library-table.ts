/**
 * Inspect public_figure_library columns via PostgREST OpenAPI
 */
import { createAdminClient, getSupabaseProjectUrl } from "../lib/supabaseAdmin";

async function main() {
  const url = getSupabaseProjectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const spec = (await res.json()) as {
    definitions?: Record<
      string,
      { properties?: Record<string, unknown> }
    >;
  };

  const def = spec.definitions?.public_figure_library;
  if (!def?.properties) {
    console.log("Could not read OpenAPI schema for public_figure_library");
    console.log("Keys in definitions:", Object.keys(spec.definitions ?? {}));
    return;
  }

  console.log("public_figure_library columns:");
  for (const col of Object.keys(def.properties).sort()) {
    console.log(" ", col);
  }

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("public_figure_library")
    .select("*", { count: "exact", head: true });
  console.log("\nRow count:", count ?? 0);
}

main().catch(console.error);
