import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Profile } from '@shared/types'

interface ProfileStore {
  profiles: Profile[]
  selectedProfileId: string | null
  runningProfileIds: string[]
  setProfiles: (profiles: Profile[]) => void
  addProfile: (profile: Profile) => void
  removeProfile: (id: string) => void
  selectProfile: (id: string | null) => void
  updateProfile: (id: string, data: Partial<Profile>) => void
  setProfileRunning: (id: string) => void
  setProfileStopped: (id: string) => void
}

export const useProfileStore = create<ProfileStore>()(
  immer((set) => ({
    profiles: [],
    selectedProfileId: null,
    runningProfileIds: [],
    setProfiles: (profiles) => set((state) => { state.profiles = profiles }),
    addProfile: (profile) => set((state) => { state.profiles.push(profile) }),
    removeProfile: (id) => set((state) => {
      state.profiles = state.profiles.filter((p) => p.id !== id)
      state.runningProfileIds = state.runningProfileIds.filter((rid) => rid !== id)
    }),
    selectProfile: (id) => set((state) => { state.selectedProfileId = id }),
    updateProfile: (id, data) => set((state) => {
      const idx = state.profiles.findIndex((p) => p.id === id)
      if (idx !== -1) Object.assign(state.profiles[idx], data)
    }),
    setProfileRunning: (id) => set((state) => {
      const idx = state.profiles.findIndex((p) => p.id === id)
      if (idx !== -1) state.profiles[idx].status = 'running'
      if (!state.runningProfileIds.includes(id)) state.runningProfileIds.push(id)
    }),
    setProfileStopped: (id) => set((state) => {
      const idx = state.profiles.findIndex((p) => p.id === id)
      if (idx !== -1) state.profiles[idx].status = 'stopped'
      state.runningProfileIds = state.runningProfileIds.filter((rid) => rid !== id)
    })
  }))
)
