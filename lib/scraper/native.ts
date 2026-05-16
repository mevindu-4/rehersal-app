import * as cheerio from "cheerio";

export async function scrapeNative(
  url: string
): Promise<{ text: string; title: string }> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; RehearsalBot/1.0; +https://github.com/Rehersal-labs/rehersal-app)",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, aside, noscript, iframe").remove();

  const title = $("title").first().text().trim() || new URL(url).hostname;
  const text = $("body").text().replace(/\s+/g, " ").trim();

  return { text, title };
}
