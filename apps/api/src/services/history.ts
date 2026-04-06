import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/client";
import { watchHistory } from "../db/schema";

export interface UpsertProgressInput {
  animeId: number;
  episodeId: string;
  episodeNumber: number;
  progressSeconds: number;
  durationSeconds: number;
  animeTitle: string;
  animeCover?: string | null;
}

export async function upsertProgress(input: UpsertProgressInput) {
  await db
    .insert(watchHistory)
    .values({
      animeId: input.animeId,
      episodeId: input.episodeId,
      episodeNumber: input.episodeNumber,
      progressSeconds: input.progressSeconds,
      durationSeconds: input.durationSeconds,
      animeTitle: input.animeTitle,
      animeCover: input.animeCover ?? null,
      watchedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [watchHistory.animeId, watchHistory.episodeId],
      set: {
        progressSeconds: input.progressSeconds,
        durationSeconds: input.durationSeconds,
        animeTitle: input.animeTitle,
        animeCover: input.animeCover ?? null,
        watchedAt: new Date().toISOString(),
      },
    });
}

export async function getHistory(limit = 30) {
  return db
    .select()
    .from(watchHistory)
    .orderBy(desc(watchHistory.watchedAt))
    .limit(limit);
}

export async function getAnimeHistory(animeId: number) {
  return db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.animeId, animeId))
    .orderBy(desc(watchHistory.watchedAt));
}

export async function getEpisodeProgress(animeId: number, episodeId: string) {
  const rows = await db
    .select()
    .from(watchHistory)
    .where(
      and(
        eq(watchHistory.animeId, animeId),
        eq(watchHistory.episodeId, episodeId)
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getContinueWatching(limit = 12) {
  // Return most-recent entry per anime where progress is < 95% of duration
  const all = await db
    .select()
    .from(watchHistory)
    .orderBy(desc(watchHistory.watchedAt));

  const seen = new Set<number>();
  const result = [];

  for (const entry of all) {
    if (seen.has(entry.animeId)) continue;
    seen.add(entry.animeId);

    // Skip if effectively finished (>= 95%)
    if (
      entry.durationSeconds > 0 &&
      entry.progressSeconds / entry.durationSeconds >= 0.95
    ) {
      continue;
    }

    result.push(entry);
    if (result.length >= limit) break;
  }

  return result;
}
