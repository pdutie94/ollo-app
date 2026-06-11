import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ThemePreference = 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  return pref
}

function applyTheme(resolved: ResolvedTheme): void {
  if (resolved === 'light') {
    document.documentElement.classList.add('light')
  } else {
    document.documentElement.classList.remove('light')
  }
}

interface ThemeStore {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (pref: ThemePreference) => void
}

const STORAGE_KEY = 'ollo-theme-preference'

function loadPreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // localStorage unavailable
  }
  return 'dark'
}

function savePreference(pref: ThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, pref)
  } catch {
    // localStorage unavailable
  }
}

const initialPreference = loadPreference()
const initialResolved = resolveTheme(initialPreference)

// Apply on load to prevent flash
applyTheme(initialResolved)

export const useThemeStore = create<ThemeStore>()(
  immer((set) => ({
    preference: initialPreference,
    resolved: initialResolved,

    setPreference: (pref) =>
      set((state) => {
        state.preference = pref
        state.resolved = resolveTheme(pref)
        savePreference(pref)
        applyTheme(state.resolved)
      })
  }))
)
