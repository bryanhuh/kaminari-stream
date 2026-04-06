import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { providerIdCache } from "../db/schema";
import { searchAnime } from "./consumet";

// Manual overrides: anilistId -> providerAnimeId
// Add entries here when auto-resolution returns wrong results
const OVERRIDES: Record<number, string> = {};

export async function resolveProviderAnimeId(
  anilistId: number,
  title: string
): Promise<string | null> {
  // 1. Check manual overrides
  if (OVERRIDES[anilistId]) return OVERRIDES[anilistId];

  // 2. Check cache
  const rows = await db
    .select()
    .from(providerIdCache)
    .where(eq(providerIdCache.anilistId, anilistId))
    .limit(1);
  const cached = rows[0];

  if (cached) return cached.providerAnimeId;

  // 3. Search consumet by title
  const results = await searchAnime(title);
  if (!results.length) return null;

  // Take the first result (best match by consumet's own ranking)
  const providerAnimeId = results[0].id;

  // 4. Cache the result
  await db
    .insert(providerIdCache)
    .values({ anilistId, providerAnimeId })
    .onConflictDoUpdate({
      target: providerIdCache.anilistId,
      set: { providerAnimeId, updatedAt: new Date().toISOString() },
    });

  return providerAnimeId;
}
