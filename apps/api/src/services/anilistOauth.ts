import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users, anilistOauth } from "../db/schema";
import { config } from "../config";

const ANILIST_CLIENT_ID = process.env.ANILIST_CLIENT_ID || "";
const ANILIST_CLIENT_SECRET = process.env.ANILIST_CLIENT_SECRET || "";
const ANILIST_REDIRECT_URI = process.env.ANILIST_REDIRECT_URI || "http://localhost:5173/auth/anilist/callback";

export function getAniListAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: ANILIST_CLIENT_ID,
    redirect_uri: ANILIST_REDIRECT_URI,
    response_type: "code",
    state,
  });
  return `https://anilist.co/api/v2/oauth/authorize?${params}`;
}

interface AniListTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

interface AniListUser {
  id: number;
  name: string;
}

export async function exchangeCodeForToken(code: string): Promise<AniListTokenResponse> {
  const res = await fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: ANILIST_CLIENT_ID,
      client_secret: ANILIST_CLIENT_SECRET,
      redirect_uri: ANILIST_REDIRECT_URI,
      code,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to exchange code for token");
  }

  return res.json();
}

export async function getAniListUser(accessToken: string): Promise<AniListUser> {
  const res = await fetch("https://graphql.anilist.co/", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query { Viewer { id name } }`,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch AniList user");
  }

  const data = await res.json();
  if (data.errors) {
    throw new Error(data.errors[0]?.message || "AniList API error");
  }

  return data.data.Viewer;
}

export async function saveOAuthCredentials(
  userId: number,
  anilistUserId: number,
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number | undefined
) {
  const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

  const existing = await db
    .select()
    .from(anilistOauth)
    .where(eq(anilistOauth.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(anilistOauth)
      .set({
        anilistUserId,
        accessToken,
        refreshToken: refreshToken || existing[0].refreshToken,
        expiresAt,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(anilistOauth.userId, userId));
  } else {
    // Insert new
    await db.insert(anilistOauth).values({
      userId,
      anilistUserId,
      accessToken,
      refreshToken,
      expiresAt,
    });
  }

  // Update user's anilistId
  await db.update(users).set({ anilistId: anilistUserId }).where(eq(users.id, userId));
}

export async function getOAuthStatus(userId: number) {
  const row = await db
    .select()
    .from(anilistOauth)
    .where(eq(anilistOauth.userId, userId))
    .limit(1);

  if (!row.length) {
    return null;
  }

  return {
    anilistUserId: row[0].anilistUserId,
    createdAt: row[0].createdAt,
    updatedAt: row[0].updatedAt,
  };
}

export async function disconnectAniList(userId: number) {
  await db.delete(anilistOauth).where(eq(anilistOauth.userId, userId));
  await db.update(users).set({ anilistId: null }).where(eq(users.id, userId));
}
