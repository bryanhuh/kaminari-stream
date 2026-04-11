import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/client";
import { watchlist } from "../db/schema";

export interface AddToWatchlistInput {
  userId: number;
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  format?: string | null;
  episodes?: number | null;
  score?: number | null;
  status?: string | null;
}

export async function addToWatchlist(input: AddToWatchlistInput) {
  await db
    .insert(watchlist)
    .values({
      userId: input.userId,
      animeId: input.animeId,
      animeTitle: input.animeTitle,
      animeCover: input.animeCover ?? null,
      format: input.format ?? null,
      episodes: input.episodes ?? null,
      score: input.score ?? null,
      status: input.status ?? null,
    })
    .onConflictDoNothing();
}

export async function removeFromWatchlist(userId: number, animeId: number) {
  await db
    .delete(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)));
}

export async function getWatchlist(userId: number) {
  return db
    .select()
    .from(watchlist)
    .where(eq(watchlist.userId, userId))
    .orderBy(desc(watchlist.addedAt));
}

export async function getWatchlistEntry(userId: number, animeId: number) {
  const rows = await db
    .select()
    .from(watchlist)
    .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)))
    .limit(1);
  return rows[0] ?? null;
}
