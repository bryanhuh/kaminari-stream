import { eq, desc, and } from "drizzle-orm";
import { db } from "../db/client";
import { comments, users } from "../db/schema";

export async function getComments(animeId: number, episodeId: string) {
  return db
    .select({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
      username: users.username,
    })
    .from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.animeId, animeId), eq(comments.episodeId, episodeId)))
    .orderBy(desc(comments.createdAt));
}

export async function addComment(input: {
  userId: number;
  animeId: number;
  episodeId: string;
  body: string;
}) {
  const rows = await db
    .insert(comments)
    .values(input)
    .returning({
      id: comments.id,
      body: comments.body,
      createdAt: comments.createdAt,
    });
  return rows[0];
}

export async function deleteComment(userId: number, commentId: number) {
  await db
    .delete(comments)
    .where(and(eq(comments.id, commentId), eq(comments.userId, userId)));
}
