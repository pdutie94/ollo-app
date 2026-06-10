---
name: drizzle-better-sqlite3
description: >-
  Guides Drizzle ORM with better-sqlite3 in the Electron main process. Use when
  editing src/main/db/**, schema, migrations, drizzle.config.ts, or database
  queries accessed via IPC handlers.
---

# Drizzle + better-sqlite3 skill

## Database initialization (`src/main/db/index.ts`)
- Import `better-sqlite3` and `drizzle-orm/better-sqlite3`.
- Create a singleton connection:

```ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

const sqlite = new Database('ollo.db') // stored in userData
export const db = drizzle(sqlite)
```

## Schema (`src/main/db/schema.ts`)
- Define tables using `sqliteTable`, `text`, `integer`, etc.
- Use `varchar` for IDs, `integer` for timestamps.
- Add `createdAt` and `updatedAt` fields.
- Export all tables and relations.

Example:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  groupId: text('group_id'),
  proxyId: text('proxy_id'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
})
```

## Queries
- Use `db.select().from(profiles).all()` etc.
- Always import from `drizzle-orm`.
- Migrations: use `drizzle-kit` with `drizzle.config.ts`.

## Important
- Only main process accesses the DB.
- IPC handlers call db functions and return plain objects.
