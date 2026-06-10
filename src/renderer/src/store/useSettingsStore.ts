import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { UserSettings } from '@shared/types'

interface SettingsStore {
  settings: Partial<UserSettings>
  loading: boolean
  setSettings: (settings: Partial<UserSettings>) => void
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void
  setLoading: (loading: boolean) => void
}

export const useSettingsStore = create<SettingsStore>()(
  immer((set) => ({
    settings: {},
    loading: true,
    setSettings: (settings) => set((state) => { state.settings = settings; state.loading = false }),
    updateSetting: (key, value) => set((state) => {
      (state.settings as Record<string, unknown>)[key as string] = value
    }),
    setLoading: (loading) => set((state) => { state.loading = loading })
  }))
)
