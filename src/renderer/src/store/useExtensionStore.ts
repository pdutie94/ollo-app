import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { AppExtension } from '@shared/types'

interface ExtensionStore {
  extensions: AppExtension[]
  setExtensions: (extensions: AppExtension[]) => void
  addExtension: (ext: AppExtension) => void
  removeExtension: (id: string) => void
  updateExtension: (id: string, data: Partial<AppExtension>) => void
  toggleExtension: (id: string, enabled: boolean) => void
}

export const useExtensionStore = create<ExtensionStore>()(
  immer((set) => ({
    extensions: [],
    setExtensions: (extensions) => set((state) => { state.extensions = extensions }),
    addExtension: (ext) => set((state) => { state.extensions.push(ext) }),
    removeExtension: (id) => set((state) => {
      state.extensions = state.extensions.filter((e) => e.id !== id)
    }),
    updateExtension: (id, data) => set((state) => {
      const idx = state.extensions.findIndex((e) => e.id === id)
      if (idx !== -1) Object.assign(state.extensions[idx], data)
    }),
    toggleExtension: (id, enabled) => set((state) => {
      const idx = state.extensions.findIndex((e) => e.id === id)
      if (idx !== -1) state.extensions[idx].enabled = enabled
    })
  }))
)
