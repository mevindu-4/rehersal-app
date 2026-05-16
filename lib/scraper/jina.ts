export async function scrapeJina(
  url: string
): Promise<{ text: string; title: string }> {
  const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
  const apiKey = process.env.JINA_API_KEY;

  const res = await fetch(jinaUrl, {
    headers: {
      Accept: "text/plain",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Jina reader HTTP ${res.status}`);
  }

  const text = (await res.text()).trim();
  const title = new URL(url).hostname;

  return { text, title };
}
