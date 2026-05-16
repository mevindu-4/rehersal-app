const TIMEOUT_MS = 10_000;

export async function scrapeUrl(url: string): Promise<{
  text: string;
  title: string;
  error?: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const res = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: { Accept: "text/plain" },
    });

    if (!res.ok) {
      return {
        text: "",
        title: "",
        error: `Scrape failed with status ${res.status}`,
      };
    }

    let text = await res.text();
    text = stripHtml(text).trim();

    const titleMatch = text.match(/^Title:\s*(.+)$/m);
    const title = titleMatch?.[1]?.trim() ?? new URL(url).hostname;

    return { text, title };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown scrape error";
    return { text: "", title: "", error: message };
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
