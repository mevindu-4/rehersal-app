import { createServiceSupabaseClient } from "@/lib/db";

function excerpt(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

/** LinkedIn, articles, and other sources attached to the target (interviewer) profile. */
export async function getTargetSourceContext(
  targetProfileId: string,
  options?: { maxTotalChars?: number }
): Promise<{ text: string; sourceCount: number }> {
  const maxTotal = options?.maxTotalChars ?? 10_000;
  const supabase = createServiceSupabaseClient();

  const { data: target } = await supabase
    .from("target_profiles")
    .select("name, raw_content, reconstruction_status")
    .eq("id", targetProfileId)
    .single();

  const parts: string[] = [];
  let sourceCount = 0;

  const { data: sources } = await supabase
    .from("target_sources")
    .select("source_type, url, raw_text, status")
    .eq("target_profile_id", targetProfileId)
    .neq("status", "failed")
    .order("created_at", { ascending: true });

  for (const source of sources ?? []) {
    const text = (source.raw_text as string | null)?.trim();
    if (!text) continue;
    sourceCount += 1;
    const label = String(source.source_type ?? "source").replace(/_/g, " ");
    const url = source.url ? ` (${source.url})` : "";
    parts.push(`[${label}${url}]\n${excerpt(text, 3500)}`);
  }

  const raw = (target?.raw_content as string | null)?.trim();
  if (raw && parts.length === 0) {
    parts.push(`[Reconstructed profile sources]\n${excerpt(raw, maxTotal)}`);
    sourceCount = 1;
  } else if (raw) {
    parts.push(`[Combined reconstruction]\n${excerpt(raw, 2500)}`);
  }

  let combined = parts.join("\n\n");
  if (combined.length > maxTotal) {
    combined = excerpt(combined, maxTotal);
  }

  return { text: combined, sourceCount };
}
