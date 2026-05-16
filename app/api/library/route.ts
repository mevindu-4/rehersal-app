import { createServiceClient } from "@/lib/supabase/server";
import { jsonOk } from "@/lib/api-response";
import libraryIndex from "@/public/library/index.json";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase();

  const supabase = createServiceClient();
  const { data: dbFigures } = await supabase
    .from("public_figure_library")
    .select("*")
    .eq("moderation_status", "approved");

  const seedFigures = libraryIndex.figures;
  let combined = [
    ...(dbFigures ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      title: f.title,
      domain: f.domain,
      type: "public_figure",
      accuracy_rating: f.accuracy_rating,
      usage_count: f.usage_count,
    })),
    ...seedFigures.map((f) => ({
      ...f,
      accuracy_rating: null,
      usage_count: 0,
    })),
  ];

  if (q) {
    combined = combined.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.domain?.toLowerCase().includes(q)
    );
  }

  return jsonOk(combined);
}
