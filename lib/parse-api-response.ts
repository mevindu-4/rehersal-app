/** Safely parse JSON from an API response (avoids empty-body SyntaxError on 500s). */
export async function parseApiResponse<T = Record<string, unknown>>(
  res: Response
): Promise<T> {
  const text = await res.text();
  if (!text.trim()) {
    if (res.ok) return {} as T;
    throw new Error(`Request failed (${res.status})`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      res.ok
        ? "Invalid response from server"
        : `Request failed (${res.status})`
    );
  }
}

export function apiErrorMessage(
  data: { error?: string } | null,
  fallback: string
): string {
  return data?.error ?? fallback;
}
