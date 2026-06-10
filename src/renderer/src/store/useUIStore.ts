import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ActiveView = 'dashboard' | 'profiles' | 'groups' | 'proxies' | 'extensions' | 'settings'

interface UIStore {
  sidebarOpen: boolean
  activeView: ActiveView
  toggleSidebar: () => void
  setActiveView: (view: ActiveView) => void
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    sidebarOpen: true,
    activeView: 'dashboard',
    toggleSidebar: () => set((state) => { state.sidebarOpen = !state.sidebarOpen }),
    setActiveView: (view) => set((state) => { state.activeView = view })
  }))
)
