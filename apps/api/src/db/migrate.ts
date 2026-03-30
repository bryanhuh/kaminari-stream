import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { config } from "../config";

export function runMigrations() {
  mkdirSync(dirname(config.databasePath), { recursive: true });
  const sqlite = new Database(config.databasePath);
  sqlite.pragma("journal_mode = WAL");

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS provider_id_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anilist_id INTEGER NOT NULL UNIQUE,
      provider TEXT NOT NULL DEFAULT 'gogoanime',
      provider_anime_id TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anime_id INTEGER NOT NULL,
      episode_id TEXT NOT NULL,
      episode_number INTEGER NOT NULL,
      progress_seconds REAL NOT NULL DEFAULT 0,
      duration_seconds REAL NOT NULL DEFAULT 0,
      anime_title TEXT NOT NULL,
      anime_cover TEXT,
      watched_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(anime_id, episode_id)
    );
  `);

  sqlite.close();
}
