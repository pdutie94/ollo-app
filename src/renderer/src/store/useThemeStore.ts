import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ThemePreference = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') return getSystemTheme()
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
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch {
    // localStorage unavailable
  }
  return 'system'
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
  immer((set) => {
    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        set((state) => {
          if (state.preference === 'system') {
            state.resolved = getSystemTheme()
            applyTheme(state.resolved)
          }
        })
      })
    }

    return {
      preference: initialPreference,
      resolved: initialResolved,

      setPreference: (pref) =>
        set((state) => {
          state.preference = pref
          state.resolved = resolveTheme(pref)
          savePreference(pref)
          applyTheme(state.resolved)
        })
    }
  })
)
