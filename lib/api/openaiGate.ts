import { isOpenAIConfigured } from "@/lib/openai";
import { jsonError } from "./http";

/** Returns 503 response when OpenAI key is missing; otherwise null. */
export function requireOpenAIConfigured(): Response | null {
  if (!isOpenAIConfigured()) {
    return jsonError(
      "OpenAI is not configured. Add OPENAI_API_KEY to enable this feature.",
      503,
      "OPENAI_NOT_CONFIGURED"
    );
  }
  return null;
}
