import { app } from 'electron'
import { join } from 'path'
import { readFileSync, existsSync } from 'fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

export let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDbPath(): string {
  return join(app.getPath('userData'), 'ollo.db')
}

export function initDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) return db

  try {
    const sqlite = new Database(getDbPath())
    sqlite.pragma('journal_mode = WAL')
    sqlite.pragma('foreign_keys = ON')

    // Auto-run migration if tables don't exist yet
    const tableCount = sqlite.prepare(
      "SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table' AND name IN ('profiles','proxies','groups','settings')"
    ).get() as { cnt: number }

    // 8.1.2: Check if fingerprint column exists; add if missing
    const fpColumnCheck = sqlite.prepare(
      "SELECT COUNT(*) as cnt FROM pragma_table_info('profiles') WHERE name='fingerprint'"
    ).get() as { cnt: number }
    if (fpColumnCheck.cnt === 0) {
      try {
        sqlite.exec("ALTER TABLE profiles ADD COLUMN fingerprint text DEFAULT '{}'")
      } catch (e) {
        console.error('Failed to add fingerprint column:', e)
      }
    }

    if (tableCount.cnt < 4) {
      const migrationPath = join(app.getAppPath(), '..', '..', 'drizzle', '0000_warm_mystique.sql')
      // Try alternate paths (dev vs prod)
      let migrationSql: string | null = null
      for (const p of [
        migrationPath,
        join(__dirname, '..', '..', '..', '..', 'drizzle', '0000_warm_mystique.sql'),
        join(__dirname, '..', '..', 'drizzle', '0000_warm_mystique.sql')
      ]) {
        if (existsSync(p)) {
          migrationSql = readFileSync(p, 'utf-8')
          break
        }
      }

      if (migrationSql) {
        // Split by statement-breakpoint and run each
        const statements = migrationSql.split('--> statement-breakpoint')
        for (const stmt of statements) {
          const trimmed = stmt.trim()
          if (trimmed) sqlite.exec(trimmed)
        }
      } else {
        // Fallback: create tables directly from schema
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS profiles (
            id text PRIMARY KEY NOT NULL,
            name text NOT NULL,
            notes text,
            group_id text,
            proxy_id text,
            user_agent text,
            tags text DEFAULT '[]',
            fingerprint text DEFAULT '{}',
            status text DEFAULT 'stopped' NOT NULL,
            created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
          CREATE TABLE IF NOT EXISTS proxies (
            id text PRIMARY KEY NOT NULL,
            type text NOT NULL,
            host text NOT NULL,
            port integer NOT NULL,
            username text,
            password text,
            created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
          CREATE TABLE IF NOT EXISTS groups (
            id text PRIMARY KEY NOT NULL,
            name text NOT NULL,
            color text,
            created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
          CREATE TABLE IF NOT EXISTS settings (
            id text PRIMARY KEY NOT NULL,
            data text DEFAULT '{}',
            extensions text DEFAULT '[]',
            created_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at integer DEFAULT CURRENT_TIMESTAMP NOT NULL
          );
        `)
      }
    }

    db = drizzle(sqlite, { schema })
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    return null as unknown as ReturnType<typeof drizzle<typeof schema>>
  }
}

export function getDb(): NonNullable<typeof db> {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

