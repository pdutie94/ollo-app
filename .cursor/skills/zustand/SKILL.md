---
name: zustand
description: >-
  Guides Zustand state management with immer middleware for the renderer. Use when
  editing src/renderer/store/**, creating stores, selectors, or integrating store
  updates with IPC results.
---

# Zustand skill

## Store creation
- Use `create` from `zustand`.
- Wrap with `immer` middleware for immutable updates.
- Type store with `interface`.

Example:

```ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface ProfileStore {
  profiles: Profile[]
  addProfile: (profile: Profile) => void
  removeProfile: (id: string) => void
}

export const useProfileStore = create<ProfileStore>()(
  immer((set) => ({
    profiles: [],
    addProfile: (profile) => set((state) => { state.profiles.push(profile) }),
    removeProfile: (id) => set((state) => { state.profiles = state.profiles.filter(p => p.id !== id) })
  }))
)
```

## Integration with IPC
- In component, call `window.electronAPI` and update store after result.
- Do not put IPC calls inside store actions directly; keep store pure.

## Best practices
- Keep stores small and focused (profile store, proxy store, settings store).
- Use selectors for performance: `const profiles = useProfileStore(s => s.profiles)`.
