import { createServiceSupabaseClient } from "@/lib/db";
import { completion, completionJSON, isOpenAIConfigured } from "@/lib/openai";
import {
  buildAvatarBriefPrompt,
  buildReconstructionPrompt,
} from "@/lib/prompts";
import { PersonalityJSONSchema } from "@/lib/schemas";
import { scrapeUrl } from "@/lib/scraper";
import { parseFile } from "@/lib/fileParser";
import type { TargetSource } from "@/types";

export async function reconstructTarget(targetId: string): Promise<void> {
  const supabase = createServiceSupabaseClient();

  if (!isOpenAIConfigured()) {
    await supabase
      .from("target_profiles")
      .update({
        status: "failed",
        error_message: "OPENAI_API_KEY not configured",
      })
      .eq("id", targetId);
    return;
  }

  await supabase
    .from("target_profiles")
    .update({ status: "reconstructing", error_message: null })
    .eq("id", targetId);

  try {
    const { data: sources, error: sourcesError } = await supabase
      .from("target_sources")
      .select("*")
      .eq("target_profile_id", targetId)
      .neq("status", "failed");

    if (sourcesError) throw sourcesError;

    const labeledChunks: string[] = [];

    for (const source of (sources ?? []) as TargetSource[]) {
      const text = await resolveSourceText(supabase, source);
      if (!text) continue;

      await supabase
        .from("target_sources")
        .update({
          raw_text: text,
          status: "success",
          scraped_at: new Date().toISOString(),
        })
        .eq("id", source.id);

      const label =
        source.title ??
        source.url ??
        source.manual_text?.slice(0, 40) ??
        "Source";
      labeledChunks.push(`=== SOURCE: ${label} ===\n${text}`);
    }

    if (labeledChunks.length === 0) {
      throw new Error("No usable source content for reconstruction");
    }

    const labeledSources = labeledChunks.join("\n\n");
    const personality = await completionJSON(
      buildReconstructionPrompt(labeledSources),
      PersonalityJSONSchema
    );
    const avatarBrief = await completion(buildAvatarBriefPrompt(personality));

    const { error: updateError } = await supabase
      .from("target_profiles")
      .update({
        personality_json: personality,
        avatar_brief_template: avatarBrief,
        status: "complete",
        error_message: null,
      })
      .eq("id", targetId);

    if (updateError) throw updateError;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reconstruction failed";
    await supabase
      .from("target_profiles")
      .update({ status: "failed", error_message: message })
      .eq("id", targetId);
  }
}

async function resolveSourceText(
  supabase: ReturnType<typeof createServiceSupabaseClient>,
  source: TargetSource
): Promise<string | null> {
  if (source.raw_text?.trim()) return source.raw_text;

  if (source.source_type === "manual" && source.manual_text) {
    return source.manual_text;
  }

  if (source.source_type === "url" && source.url) {
    const result = await scrapeUrl(source.url);
    if (result.status === "success" && result.text) {
      return result.text;
    }
    if (result.status === "needs_manual") {
      await supabase
        .from("target_sources")
        .update({ status: "needs_manual", error_message: result.message })
        .eq("id", source.id);
    } else {
      await supabase
        .from("target_sources")
        .update({ status: "failed", error_message: result.message })
        .eq("id", source.id);
    }
    return null;
  }

  if (source.source_type === "document" && source.document_id) {
    const { data: doc } = await supabase
      .from("user_documents")
      .select("extracted_text, file_url, file_type")
      .eq("id", source.document_id)
      .single();

    if (doc?.extracted_text) return doc.extracted_text;

    if (doc?.file_url && doc.file_type) {
      const res = await fetch(doc.file_url);
      if (!res.ok) return null;
      const buffer = Buffer.from(await res.arrayBuffer());
      return parseFile(buffer, doc.file_type);
    }
  }

  return null;
}
