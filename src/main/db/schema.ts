import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { sql } from 'drizzle-orm'
import type { UserSettings } from '@shared/types'

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  notes: text('notes'),
  groupId: text('group_id'),
  proxyId: text('proxy_id'),
  userAgent: text('user_agent'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  status: text('status').notNull().default('stopped'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})

export const proxies = sqliteTable('proxies', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['http', 'https', 'socks5'] }).notNull(),
  host: text('host').notNull(),
  port: integer('port').notNull(),
  username: text('username'),
  password: text('password'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})

export const groups = sqliteTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})

export const settings = sqliteTable('settings', {
  id: text('id').primaryKey(),
  data: text('data', { mode: 'json' }).$type<Partial<UserSettings>>().default(sql`'{}'`),
  extensions: text('extensions', { mode: 'json' }).$type<string[]>().default(sql`'[]'`),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`)
})
