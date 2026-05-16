import { getSupabaseProjectUrl } from "@/lib/supabaseAdmin";

let cachedColumns: string[] | null = null;
let cachedIdFormat: "text" | "uuid" | "unknown" | null = null;

type OpenApiProp = { type?: string; format?: string };

/** Column names on public_figure_library from PostgREST OpenAPI (cached). */
export async function getLibraryTableColumns(): Promise<string[]> {
  if (cachedColumns) return cachedColumns;

  const url = getSupabaseProjectUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return [];

  const res = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  const spec = (await res.json()) as {
    definitions?: Record<string, { properties?: Record<string, OpenApiProp> }>;
  };
  const props = spec.definitions?.public_figure_library?.properties ?? {};
  cachedColumns = Object.keys(props);
  const idProp = props.id;
  cachedIdFormat =
    idProp?.format === "uuid"
      ? "uuid"
      : idProp?.type === "string"
        ? "text"
        : "unknown";
  return cachedColumns;
}

export async function getLibraryIdFormat(): Promise<"text" | "uuid" | "unknown"> {
  await getLibraryTableColumns();
  return cachedIdFormat ?? "unknown";
}

export function resetLibrarySchemaCache(): void {
  cachedColumns = null;
  cachedIdFormat = null;
}

export async function getLibrarySchemaCapabilities(): Promise<{
  columns: string[];
  seedable: boolean;
  ready: boolean;
  idFormat: "text" | "uuid" | "unknown";
}> {
  const columns = await getLibraryTableColumns();
  const has = (col: string) => columns.includes(col);

  const idFormat = await getLibraryIdFormat();

  const seedable =
    has("id") &&
    has("name") &&
    has("profile_json") &&
    has("avatar_brief_template") &&
    idFormat !== "uuid";

  const ready =
    seedable && has("category") && has("is_featured") && has("domain");

  return { columns, seedable, ready, idFormat };
}
