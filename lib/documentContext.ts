import { createServiceSupabaseClient } from "@/lib/db";

const DOC_TYPE_PRIORITY = [
  "company",
  "opportunity",
  "my_background",
  "product",
  "prior_interactions",
  "other",
] as const;

function excerpt(text: string, maxLen: number): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen)}…`;
}

/** Fallback: full extracted text from user documents when vector search returns nothing. */
export async function getDocumentTextContext(
  orgId: string,
  userId: string,
  options?: { maxParts?: number; excerptChars?: number }
): Promise<string[]> {
  const maxParts = options?.maxParts ?? 10;
  const excerptChars = options?.excerptChars ?? 2800;
  const supabase = createServiceSupabaseClient();

  const { data: docs } = await supabase
    .from("user_documents")
    .select("filename, doc_type, extracted_text")
    .eq("user_id", userId)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (!docs?.length) return [];

  const parts: string[] = [];
  const byType = new Map<string, typeof docs>();
  for (const doc of docs) {
    const type = String(doc.doc_type ?? "other");
    const list = byType.get(type) ?? [];
    list.push(doc);
    byType.set(type, list);
  }

  for (const docType of DOC_TYPE_PRIORITY) {
    for (const doc of byType.get(docType) ?? []) {
      const text = (doc.extracted_text as string | null)?.trim();
      if (!text) continue;
      const label = docType.replace(/_/g, " ");
      parts.push(`[${label}: ${doc.filename}]\n${excerpt(text, excerptChars)}`);
    }
  }

  return parts.slice(0, maxParts);
}
