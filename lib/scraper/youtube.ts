import { YoutubeTranscript } from "youtube-transcript";

export async function scrapeYouTube(
  url: string
): Promise<{ text: string; title: string }> {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  const segments = await YoutubeTranscript.fetchTranscript(videoId);
  const text = segments.map((s) => s.text).join(" ").trim();

  return { text, title: `YouTube ${videoId}` };
}

function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1) || null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}
