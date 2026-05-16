import { jsonOk } from "@/lib/api/http";
import { isOpenAIConfigured } from "@/lib/openai";
import { isLibraryDbReady } from "@/lib/libraryDbReady";

export async function GET() {
  let libraryDb = false;
  try {
    libraryDb = await isLibraryDbReady();
  } catch {
    libraryDb = false;
  }

  return jsonOk({
    status: "ok",
    service: "rehearsal-api",
    checks: {
      openai_configured: isOpenAIConfigured(),
      supabase_url_set: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()),
      bey_configured: Boolean(
        process.env.BEY_API_KEY?.trim() && process.env.BEY_AGENT_ID?.trim()
      ),
      library_db_ready: libraryDb,
    },
  });
}
