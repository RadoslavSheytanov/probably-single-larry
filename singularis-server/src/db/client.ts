// node:sqlite is built into Node.js 22.5+ — no npm package needed
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const _dir = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(process.env.DB_PATH ?? `${_dir}/../../data/singularis.db`);

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

export function initDB(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tokens (
      id              TEXT PRIMARY KEY,
      token           TEXT NOT NULL UNIQUE,
      token_hash      TEXT NOT NULL UNIQUE,
      email           TEXT NOT NULL,
      status          TEXT NOT NULL DEFAULT 'active'
                        CHECK(status IN ('active', 'revoked', 'refunded')),
      max_sessions    INTEGER NOT NULL DEFAULT 1,
      gumroad_sale_id TEXT,
      purchased_at    TEXT NOT NULL DEFAULT (datetime('now')),
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(token_hash);
  `);
  console.log('[db] SQLite ready: ' + DB_PATH);
}
