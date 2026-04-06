import { neon } from "@neondatabase/serverless";
import { config } from "../config";

export async function runMigrations() {
  const sql = neon(config.databaseUrl);

  await sql`
    CREATE TABLE IF NOT EXISTS provider_id_cache (
      id SERIAL PRIMARY KEY,
      anilist_id INTEGER NOT NULL UNIQUE,
      provider TEXT NOT NULL DEFAULT 'gogoanime',
      provider_anime_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS watchlist (
      id SERIAL PRIMARY KEY,
      anime_id INTEGER NOT NULL UNIQUE,
      anime_title TEXT NOT NULL,
      anime_cover TEXT,
      format TEXT,
      episodes INTEGER,
      score INTEGER,
      status TEXT,
      added_at TEXT NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS watch_history (
      id SERIAL PRIMARY KEY,
      anime_id INTEGER NOT NULL,
      episode_id TEXT NOT NULL,
      episode_number INTEGER NOT NULL,
      progress_seconds REAL NOT NULL DEFAULT 0,
      duration_seconds REAL NOT NULL DEFAULT 0,
      anime_title TEXT NOT NULL,
      anime_cover TEXT,
      watched_at TEXT NOT NULL DEFAULT now(),
      UNIQUE(anime_id, episode_id)
    )
  `;
}
