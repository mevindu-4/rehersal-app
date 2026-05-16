import { createServiceClient } from "@/lib/supabase/server";
import { callLlm, isDemoMode, parseJsonFromLlm } from "@/lib/llm";
import {
  RECONSTRUCTION_SYSTEM_PROMPT,
  buildReconstructionUserMessage,
} from "@/lib/prompts";
import { personalityProfileSchema } from "@/lib/schemas";
import { scrapeUrl } from "@/lib/scraper";
import { extractFileText } from "@/lib/fileParser";
import { isLlmUnavailableError, mockPersonalityProfile } from "@/lib/demoMocks";
import type { PersonalityProfile } from "@/types";

export async function reconstructTarget(targetId: string): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from("target_profiles")
    .update({
      reconstruction_status: "processing",
      reconstruction_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", targetId);

  try {
    const { data: target, error: targetErr } = await supabase
      .from("target_profiles")
      .select("*")
      .eq("id", targetId)
      .single();

    if (targetErr || !target) {
      throw new Error("Target not found");
    }

    const { data: sources } = await supabase
      .from("target_sources")
      .select("*")
      .eq("target_profile_id", targetId)
      .neq("status", "failed");

    const labeledParts: string[] = [];

    for (const source of sources ?? []) {
      let text = source.raw_text as string | null;

      if (!text && source.url) {
        await supabase
          .from("target_sources")
          .update({ status: "processing" })
          .eq("id", source.id);

        const scraped = await scrapeUrl(source.url as string);
        if (scraped.error || !scraped.text) {
          await supabase
            .from("target_sources")
            .update({ status: "failed" })
            .eq("id", source.id);
          continue;
        }
        text = scraped.text;
        await supabase
          .from("target_sources")
          .update({
            raw_text: text,
            scraped_at: new Date().toISOString(),
            status: "complete",
          })
          .eq("id", source.id);
      }

      if (text?.trim()) {
        labeledParts.push(
          `--- SOURCE: ${source.source_type}${source.url ? ` (${source.url})` : ""} ---\n${text}`
        );
      }
    }

    if (labeledParts.length === 0) {
      throw new Error("No usable source content. Add URLs or manual text.");
    }

    const raw = labeledParts.join("\n\n");
    const userMessage = buildReconstructionUserMessage(
      target.name as string,
      raw
    );

    let personality: PersonalityProfile;
    if (isDemoMode()) {
      personality = mockPersonalityProfile(target.name as string, raw);
    } else {
      try {
        const llmRaw = await callLlm(RECONSTRUCTION_SYSTEM_PROMPT, userMessage);
        const parsed = parseJsonFromLlm<PersonalityProfile>(llmRaw);
        personality = personalityProfileSchema.parse(parsed);
      } catch (e) {
        if (!isLlmUnavailableError(e)) throw e;
        personality = mockPersonalityProfile(target.name as string, raw);
      }
    }

    await supabase
      .from("target_profiles")
      .update({
        personality_json: personality,
        raw_content: raw,
        reconstruction_status: "complete",
        reconstruction_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetId);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Reconstruction failed";
    await supabase
      .from("target_profiles")
      .update({
        reconstruction_status: "failed",
        reconstruction_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetId);
    throw e;
  }
}

export async function extractSourceFile(
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt"
): Promise<string> {
  return extractFileText(buffer, fileType);
}
