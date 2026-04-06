import { pgTable, serial, integer, text, real, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const providerIdCache = pgTable("provider_id_cache", {
  id: serial("id").primaryKey(),
  anilistId: integer("anilist_id").notNull().unique(),
  provider: text("provider").notNull().default("gogoanime"),
  providerAnimeId: text("provider_anime_id").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`now()`),
});

export const watchlist = pgTable("watchlist", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull().unique(),
  animeTitle: text("anime_title").notNull(),
  animeCover: text("anime_cover"),
  format: text("format"),
  episodes: integer("episodes"),
  score: integer("score"),
  status: text("status"),
  addedAt: text("added_at").notNull().default(sql`now()`),
});

export const watchHistory = pgTable(
  "watch_history",
  {
    id: serial("id").primaryKey(),
    animeId: integer("anime_id").notNull(),
    episodeId: text("episode_id").notNull(),
    episodeNumber: integer("episode_number").notNull(),
    progressSeconds: real("progress_seconds").notNull().default(0),
    durationSeconds: real("duration_seconds").notNull().default(0),
    animeTitle: text("anime_title").notNull(),
    animeCover: text("anime_cover"),
    watchedAt: text("watched_at").notNull().default(sql`now()`),
  },
  (t) => [unique().on(t.animeId, t.episodeId)]
);
