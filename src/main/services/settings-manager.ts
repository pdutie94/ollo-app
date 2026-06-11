import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { settings } from '../db/schema'
import { defaultSettings } from '@shared/types'
import type { Settings, UserSettings } from '@shared/types'

const SETTINGS_ID = 'app-settings'

function ensureSettings(): Settings {
  try {
    const existing = getDb().select().from(settings).where(eq(settings.id, SETTINGS_ID)).all()
    if (existing.length > 0) {
      return { ...existing[0] } as Settings
    }

    const now = new Date()
    getDb().insert(settings).values({
      id: SETTINGS_ID,
      data: defaultSettings,
      extensions: [],
      createdAt: now,
      updatedAt: now
    }).run()

    return getSettings()!
  } catch (error) {
    console.error('settings-manager.ensureSettings:', error)
    throw error
  }
}

export function getSettings(): Settings | undefined {
  try {
    const result = getDb().select().from(settings).where(eq(settings.id, SETTINGS_ID)).all()
    return result[0] ? ({ ...result[0] } as Settings) : undefined
  } catch (error) {
    console.error('settings-manager.getSettings:', error)
    throw error
  }
}

export function updateSettings(partial: Partial<UserSettings>): Settings | undefined {
  try {
    ensureSettings()
    const now = new Date()

    const current = getSettings()
    if (!current) return undefined

    const merged = { ...current.data, ...partial }

    getDb().update(settings)
      .set({ data: merged, updatedAt: now })
      .where(eq(settings.id, SETTINGS_ID))
      .run()

    return getSettings()
  } catch (error) {
    console.error('settings-manager.updateSettings:', error)
    throw error
  }
}
