import { eq, desc, and, avg, count } from "drizzle-orm";
import { db } from "../db/client";
import { reviews, users } from "../db/schema";

export async function getReviews(animeId: number) {
  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      review: reviews.review,
      createdAt: reviews.createdAt,
      username: users.username,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .where(eq(reviews.animeId, animeId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewStats(animeId: number) {
  const rows = await db
    .select({ avg: avg(reviews.rating), total: count(reviews.id) })
    .from(reviews)
    .where(eq(reviews.animeId, animeId));
  return {
    average: rows[0]?.avg ? Number(rows[0].avg) : null,
    total: rows[0]?.total ?? 0,
  };
}

export async function getUserReview(userId: number, animeId: number) {
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.animeId, animeId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertReview(input: {
  userId: number;
  animeId: number;
  rating: number;
  review?: string | null;
}) {
  const rows = await db
    .insert(reviews)
    .values({
      userId: input.userId,
      animeId: input.animeId,
      rating: input.rating,
      review: input.review ?? null,
    })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.animeId],
      set: {
        rating: input.rating,
        review: input.review ?? null,
        createdAt: new Date().toISOString(),
      },
    })
    .returning();
  return rows[0];
}

export async function deleteReview(userId: number, animeId: number) {
  await db
    .delete(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.animeId, animeId)));
}
