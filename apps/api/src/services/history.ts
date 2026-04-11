import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/client";
import { watchHistory } from "../db/schema";

export interface UpsertProgressInput {
  userId: number;
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
      userId: input.userId,
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
      target: [watchHistory.userId, watchHistory.animeId, watchHistory.episodeId],
      set: {
        progressSeconds: input.progressSeconds,
        durationSeconds: input.durationSeconds,
        animeTitle: input.animeTitle,
        animeCover: input.animeCover ?? null,
        watchedAt: new Date().toISOString(),
      },
    });
}

export async function getHistory(userId: number, limit = 30) {
  return db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, userId))
    .orderBy(desc(watchHistory.watchedAt))
    .limit(limit);
}

export async function getAnimeHistory(userId: number, animeId: number) {
  return db
    .select()
    .from(watchHistory)
    .where(and(eq(watchHistory.userId, userId), eq(watchHistory.animeId, animeId)))
    .orderBy(desc(watchHistory.watchedAt));
}

export async function deleteHistoryEntry(userId: number, id: number) {
  await db
    .delete(watchHistory)
    .where(and(eq(watchHistory.id, id), eq(watchHistory.userId, userId)));
}

export async function getContinueWatching(userId: number, limit = 12) {
  const all = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, userId))
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
