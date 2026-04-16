import { pgTable, serial, integer, text, real, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  anilistId: integer("anilist_id"),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const anilistOauth = pgTable("anilist_oauth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
  anilistUserId: integer("anilist_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default(sql`now()`),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const providerIdCache = pgTable("provider_id_cache", {
  id: serial("id").primaryKey(),
  anilistId: integer("anilist_id").notNull().unique(),
  provider: text("provider").notNull().default("gogoanime"),
  providerAnimeId: text("provider_anime_id").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const watchlist = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    animeId: integer("anime_id").notNull(),
    animeTitle: text("anime_title").notNull(),
    animeCover: text("anime_cover"),
    format: text("format"),
    episodes: integer("episodes"),
    score: integer("score"),
    status: text("status"),
    addedAt: text("added_at").notNull().default(sql`now()`),
  },
  (t) => [unique().on(t.userId, t.animeId)]
);

export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    animeId: integer("anime_id").notNull(),
    rating: integer("rating").notNull(), // 1–10
    review: text("review"), // optional short text
    createdAt: text("created_at").notNull().default(sql`now()`),
  },
  (t) => [unique().on(t.userId, t.animeId)]
);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  animeId: integer("anime_id").notNull(),
  episodeId: text("episode_id").notNull(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull().default(sql`now()`),
});

export const animeStatus = pgTable(
  "anime_status",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    animeId: integer("anime_id").notNull(),
    animeTitle: text("anime_title").notNull(),
    animeCover: text("anime_cover"),
    status: text("status").notNull(), // WATCHING | COMPLETED | DROPPED | PLAN_TO_WATCH
    updatedAt: text("updated_at").notNull().default(sql`now()`),
  },
  (t) => [unique().on(t.userId, t.animeId)]
);

export const anilistCache = pgTable("anilist_cache", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),       // JSON-serialised response
  expiresAt: text("expires_at").notNull(), // epoch ms as string
});

export const watchHistory = pgTable(
  "watch_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    animeId: integer("anime_id").notNull(),
    episodeId: text("episode_id").notNull(),
    episodeNumber: integer("episode_number").notNull(),
    progressSeconds: real("progress_seconds").notNull().default(0),
    durationSeconds: real("duration_seconds").notNull().default(0),
    animeTitle: text("anime_title").notNull(),
    animeCover: text("anime_cover"),
    watchedAt: text("watched_at").notNull().default(sql`now()`),
  },
  (t) => [unique().on(t.userId, t.animeId, t.episodeId)]
);
