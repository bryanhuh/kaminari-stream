import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/client";
import { watchHistory, animeStatus, reviews, users, anilistCache } from "../db/schema";

export async function getUserStats(userId: number) {
  const [historyRows, statusRows, reviewRows, userRows] = await Promise.all([
    db.select().from(watchHistory).where(eq(watchHistory.userId, userId)),
    db.select().from(animeStatus).where(eq(animeStatus.userId, userId)),
    db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.userId, userId)),
    db
      .select({ createdAt: users.createdAt, username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
  ]);

  const totalEpisodes = historyRows.length;
  const totalHoursWatched = historyRows.reduce((sum, e) => sum + (e.progressSeconds ?? 0), 0) / 3600;
  const distinctAnime = new Set(historyRows.map((e) => e.animeId)).size;

  const statusBreakdown: Record<string, number> = {
    WATCHING: 0,
    COMPLETED: 0,
    DROPPED: 0,
    PLAN_TO_WATCH: 0,
  };
  for (const row of statusRows) {
    if (row.status in statusBreakdown) {
      statusBreakdown[row.status]++;
    }
  }

  const avgRating =
    reviewRows.length > 0
      ? reviewRows.reduce((s, r) => s + r.rating, 0) / reviewRows.length
      : null;

  return {
    totalEpisodes,
    totalHoursWatched,
    distinctAnime,
    statusBreakdown,
    avgRating,
    totalReviews: reviewRows.length,
    joinedAt: userRows[0]?.createdAt ?? null,
  };
}

export async function getUserTopGenres(userId: number): Promise<string[]> {
  // Get distinct animeIds from watch history + status (most recent activity)
  const [histRows, statusRows] = await Promise.all([
    db
      .select({ animeId: watchHistory.animeId })
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt))
      .limit(100),
    db
      .select({ animeId: animeStatus.animeId })
      .from(animeStatus)
      .where(and(eq(animeStatus.userId, userId), eq(animeStatus.status, "COMPLETED")))
      .limit(50),
  ]);

  const animeIds = [
    ...new Set([
      ...histRows.map((r) => r.animeId),
      ...statusRows.map((r) => r.animeId),
    ]),
  ].slice(0, 40);

  if (animeIds.length === 0) return [];

  const genreCount = new Map<string, number>();

  // Batch lookup from anilist_cache using known key format `detail:${id}`
  await Promise.all(
    animeIds.map(async (animeId) => {
      try {
        const rows = await db
          .select({ value: anilistCache.value })
          .from(anilistCache)
          .where(eq(anilistCache.key, `detail:${animeId}`))
          .limit(1);

        if (rows[0]) {
          const data = JSON.parse(rows[0].value) as { Media?: { genres?: string[] } };
          for (const genre of data.Media?.genres ?? []) {
            genreCount.set(genre, (genreCount.get(genre) ?? 0) + 1);
          }
        }
      } catch {
        // cache miss or parse error — skip
      }
    })
  );

  return [...genreCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);
}
