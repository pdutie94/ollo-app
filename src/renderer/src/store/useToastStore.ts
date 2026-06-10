import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastStore {
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>()(
  immer((set) => ({
    toasts: [],
    addToast: (message, type) => set((state) => {
      const id = crypto.randomUUID()
      state.toasts.push({ id, message, type })
      setTimeout(() => {
        set((s) => { s.toasts = s.toasts.filter((t) => t.id !== id) })
      }, 3000)
    }),
    removeToast: (id) => set((state) => {
      state.toasts = state.toasts.filter((t) => t.id !== id)
    })
  }))
)
