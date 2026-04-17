import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/client";
import { customLists, customListEntries } from "../db/schema";

export async function getUserLists(userId: number) {
  return db
    .select()
    .from(customLists)
    .where(eq(customLists.userId, userId))
    .orderBy(desc(customLists.createdAt));
}

export async function createList(userId: number, name: string) {
  const rows = await db
    .insert(customLists)
    .values({ userId, name })
    .onConflictDoNothing()
    .returning();
  return rows[0] ?? null;
}

export async function deleteList(userId: number, listId: number) {
  await db
    .delete(customLists)
    .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)));
}

export async function renameList(userId: number, listId: number, name: string) {
  await db
    .update(customLists)
    .set({ name })
    .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)));
}

export async function getListEntries(userId: number, listId: number) {
  const list = await db
    .select()
    .from(customLists)
    .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)))
    .limit(1);
  if (!list[0]) return null;
  return db
    .select()
    .from(customListEntries)
    .where(eq(customListEntries.listId, listId))
    .orderBy(desc(customListEntries.addedAt));
}

export async function addToList(
  userId: number,
  listId: number,
  animeId: number,
  animeTitle: string,
  animeCover?: string | null
) {
  const list = await db
    .select()
    .from(customLists)
    .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)))
    .limit(1);
  if (!list[0]) return false;
  await db
    .insert(customListEntries)
    .values({ listId, animeId, animeTitle, animeCover: animeCover ?? null })
    .onConflictDoNothing();
  return true;
}

export async function removeFromList(userId: number, listId: number, animeId: number) {
  const list = await db
    .select()
    .from(customLists)
    .where(and(eq(customLists.id, listId), eq(customLists.userId, userId)))
    .limit(1);
  if (!list[0]) return;
  await db
    .delete(customListEntries)
    .where(and(eq(customListEntries.listId, listId), eq(customListEntries.animeId, animeId)));
}
