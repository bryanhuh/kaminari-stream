import { eq, desc } from "drizzle-orm";
import { db } from "../db/client";
import { watchlist } from "../db/schema";

export interface AddToWatchlistInput {
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  format?: string | null;
  episodes?: number | null;
  score?: number | null;
  status?: string | null;
}

export function addToWatchlist(input: AddToWatchlistInput) {
  db.insert(watchlist)
    .values({
      animeId: input.animeId,
      animeTitle: input.animeTitle,
      animeCover: input.animeCover ?? null,
      format: input.format ?? null,
      episodes: input.episodes ?? null,
      score: input.score ?? null,
      status: input.status ?? null,
    })
    .onConflictDoNothing()
    .run();
}

export function removeFromWatchlist(animeId: number) {
  db.delete(watchlist).where(eq(watchlist.animeId, animeId)).run();
}

export function getWatchlist() {
  return db.select().from(watchlist).orderBy(desc(watchlist.addedAt)).all();
}

export function getWatchlistEntry(animeId: number) {
  return db
    .select()
    .from(watchlist)
    .where(eq(watchlist.animeId, animeId))
    .get();
}
