import { getLibrarySchemaCapabilities } from "@/lib/librarySchema";

let cachedReady: boolean | null = null;
let cachedSeedable: boolean | null = null;

/** True when public_figure_library has category + is_featured (migration 007). */
export async function isLibraryDbReady(): Promise<boolean> {
  if (cachedReady !== null) return cachedReady;
  const { ready } = await getLibrarySchemaCapabilities();
  cachedReady = ready;
  return ready;
}

/** True when core columns exist — partial seed allowed before 007. */
export async function isLibraryDbSeedable(): Promise<boolean> {
  if (cachedSeedable !== null) return cachedSeedable;
  const { seedable } = await getLibrarySchemaCapabilities();
  cachedSeedable = seedable;
  return seedable;
}

export function resetLibraryDbReadyCache(): void {
  cachedReady = null;
  cachedSeedable = null;
}
