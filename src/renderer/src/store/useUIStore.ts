import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type ActiveView = 'dashboard' | 'profiles' | 'groups' | 'proxies' | 'extensions' | 'settings'

interface UIStore {
  sidebarOpen: boolean
  activeView: ActiveView
  globalSearch: string
  toggleSidebar: () => void
  setActiveView: (view: ActiveView) => void
  setGlobalSearch: (query: string) => void
}

export const useUIStore = create<UIStore>()(
  immer((set) => ({
    sidebarOpen: true,
    activeView: 'dashboard',
    globalSearch: '',
    toggleSidebar: () => set((state) => { state.sidebarOpen = !state.sidebarOpen }),
    setActiveView: (view) => set((state) => { state.activeView = view }),
    setGlobalSearch: (query) => set((state) => { state.globalSearch = query })
  }))
)
