import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const providerIdCache = sqliteTable("provider_id_cache", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  anilistId: integer("anilist_id").notNull().unique(),
  provider: text("provider").notNull().default("gogoanime"),
  providerAnimeId: text("provider_anime_id").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const watchlist = sqliteTable("watchlist", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  animeId: integer("anime_id").notNull().unique(),
  animeTitle: text("anime_title").notNull(),
  animeCover: text("anime_cover"),
  format: text("format"),
  episodes: integer("episodes"),
  score: integer("score"),
  status: text("status"),
  addedAt: text("added_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const watchHistory = sqliteTable("watch_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  animeId: integer("anime_id").notNull(),
  episodeId: text("episode_id").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  progressSeconds: real("progress_seconds").notNull().default(0),
  durationSeconds: real("duration_seconds").notNull().default(0),
  animeTitle: text("anime_title").notNull(),
  animeCover: text("anime_cover"),
  watchedAt: text("watched_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
