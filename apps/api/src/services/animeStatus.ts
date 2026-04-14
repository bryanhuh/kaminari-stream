import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/client";
import { animeStatus } from "../db/schema";

export type AnimeStatusValue = "WATCHING" | "COMPLETED" | "DROPPED" | "PLAN_TO_WATCH";

export interface SetAnimeStatusInput {
  userId: number;
  animeId: number;
  animeTitle: string;
  animeCover?: string | null;
  status: AnimeStatusValue;
}

export async function setAnimeStatus(input: SetAnimeStatusInput) {
  await db
    .insert(animeStatus)
    .values({
      userId: input.userId,
      animeId: input.animeId,
      animeTitle: input.animeTitle,
      animeCover: input.animeCover ?? null,
      status: input.status,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [animeStatus.userId, animeStatus.animeId],
      set: { status: input.status, updatedAt: new Date().toISOString() },
    });
}

export async function removeAnimeStatus(userId: number, animeId: number) {
  await db
    .delete(animeStatus)
    .where(and(eq(animeStatus.userId, userId), eq(animeStatus.animeId, animeId)));
}

export async function getAnimeStatus(userId: number, animeId: number) {
  const rows = await db
    .select()
    .from(animeStatus)
    .where(and(eq(animeStatus.userId, userId), eq(animeStatus.animeId, animeId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAllAnimeStatuses(userId: number) {
  return db
    .select()
    .from(animeStatus)
    .where(eq(animeStatus.userId, userId))
    .orderBy(desc(animeStatus.updatedAt));
}
