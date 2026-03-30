import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { config } from "../config";

function createDb() {
  mkdirSync(dirname(config.databasePath), { recursive: true });
  const sqlite = new Database(config.databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite);
}

export const db = createDb();
export { Database };
