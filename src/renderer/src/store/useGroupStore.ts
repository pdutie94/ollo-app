import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Group } from '@shared/types'

interface GroupStore {
  groups: Group[]
  setGroups: (groups: Group[]) => void
  addGroup: (group: Group) => void
  removeGroup: (id: string) => void
  updateGroup: (id: string, data: Partial<Group>) => void
}

export const useGroupStore = create<GroupStore>()(
  immer((set) => ({
    groups: [],
    setGroups: (groups) => set((state) => { state.groups = groups }),
    addGroup: (group) => set((state) => { state.groups.push(group) }),
    removeGroup: (id) => set((state) => {
      state.groups = state.groups.filter((g) => g.id !== id)
    }),
    updateGroup: (id, data) => set((state) => {
      const idx = state.groups.findIndex((g) => g.id === id)
      if (idx !== -1) Object.assign(state.groups[idx], data)
    })
  }))
)
