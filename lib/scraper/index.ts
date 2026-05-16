import type { ScrapeResult } from "@/types";
import { scrapeJina } from "./jina";
import { scrapeNative } from "./native";
import { scrapeYouTube } from "./youtube";

const MANUAL_DOMAINS = [
  "linkedin.com",
  "glassdoor.com",
  "x.com",
  "twitter.com",
  "facebook.com",
  "instagram.com",
  "indeed.com",
];

const MIN_TEXT_LENGTH = 200;

export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (hostname.includes("youtube.com") || hostname === "youtu.be") {
      const { text, title } = await scrapeYouTube(url);
      if (text.length >= MIN_TEXT_LENGTH) {
        return { status: "success", text, title };
      }
      return {
        status: "failed",
        message: "YouTube transcript too short or unavailable",
      };
    }

    if (MANUAL_DOMAINS.some((d) => hostname.includes(d))) {
      return {
        status: "needs_manual",
        message: `Automatic scraping is not supported for ${hostname}. Paste content manually.`,
      };
    }

    try {
      const native = await scrapeNative(url);
      if (native.text.length >= MIN_TEXT_LENGTH) {
        return { status: "success", text: native.text, title: native.title };
      }
    } catch {
      // fall through to Jina
    }

    const jina = await scrapeJina(url);
    if (jina.text.length >= MIN_TEXT_LENGTH) {
      return { status: "success", text: jina.text, title: jina.title };
    }

    return { status: "failed", message: "Could not extract enough text from URL" };
  } catch (e) {
    return {
      status: "failed",
      message: e instanceof Error ? e.message : "Scrape failed",
    };
  }
}
