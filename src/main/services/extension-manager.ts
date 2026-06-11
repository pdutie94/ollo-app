import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { settings } from '../db/schema'
import type { AppExtension } from '@shared/types'

const SETTINGS_ID = 'app-settings'

interface SettingsRow {
  id: string
  extensions: AppExtension[]
}

function getSettingsRow(): SettingsRow | null {
  try {
    const rows = getDb().select().from(settings).where(eq(settings.id, SETTINGS_ID)).all()
    if (!rows[0]) return null
    const row = rows[0]
    const ext = row.extensions as unknown as AppExtension[]
    return { id: row.id, extensions: Array.isArray(ext) ? ext : [] }
  } catch (error) {
    console.error('extension-manager.getSettingsRow:', error)
    throw error
  }
}

function saveExtensions(extensions: AppExtension[]): void {
  try {
    const now = new Date()
    const existing = getDb().select().from(settings).where(eq(settings.id, SETTINGS_ID)).all()
    if (existing.length > 0) {
      getDb().update(settings)
        .set({ extensions: extensions as unknown as string[], updatedAt: now })
        .where(eq(settings.id, SETTINGS_ID))
        .run()
    } else {
      getDb().insert(settings).values({
        id: SETTINGS_ID,
        data: {},
        extensions: extensions as unknown as string[],
        createdAt: now,
        updatedAt: now
      }).run()
    }
  } catch (error) {
    console.error('extension-manager.saveExtensions:', error)
    throw error
  }
}

export function getExtensions(): AppExtension[] {
  try {
    const row = getSettingsRow()
    return row?.extensions ?? []
  } catch (error) {
    console.error('extension-manager.getExtensions:', error)
    throw error
  }
}

export function addExtension(data: Omit<AppExtension, 'id'>): AppExtension {
  try {
    const ext: AppExtension = {
      id: randomUUID(),
      ...data
    }
    const all = getExtensions()
    all.push(ext)
    saveExtensions(all)
    return ext
  } catch (error) {
    console.error('extension-manager.addExtension:', error)
    throw error
  }
}

export function removeExtension(id: string): boolean {
  try {
    const all = getExtensions()
    const idx = all.findIndex((e) => e.id === id)
    if (idx === -1) return false
    all.splice(idx, 1)
    saveExtensions(all)
    return true
  } catch (error) {
    console.error('extension-manager.removeExtension:', error)
    throw error
  }
}

export function toggleExtension(id: string, enabled: boolean): AppExtension | undefined {
  try {
    const all = getExtensions()
    const idx = all.findIndex((e) => e.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], enabled }
    saveExtensions(all)
    return all[idx]
  } catch (error) {
    console.error('extension-manager.toggleExtension:', error)
    throw error
  }
}
