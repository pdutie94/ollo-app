import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Proxy, ProxyTestResult } from '@shared/types'

interface ProxyStore {
  proxies: Proxy[]
  lastTestResult: ProxyTestResult | null
  setProxies: (proxies: Proxy[]) => void
  addProxy: (proxy: Proxy) => void
  removeProxy: (id: string) => void
  updateProxy: (id: string, data: Partial<Proxy>) => void
  setTestResult: (result: ProxyTestResult | null) => void
}

export const useProxyStore = create<ProxyStore>()(
  immer((set) => ({
    proxies: [],
    lastTestResult: null,
    setProxies: (proxies) => set((state) => { state.proxies = proxies }),
    addProxy: (proxy) => set((state) => { state.proxies.push(proxy) }),
    removeProxy: (id) => set((state) => {
      state.proxies = state.proxies.filter((p) => p.id !== id)
    }),
    updateProxy: (id, data) => set((state) => {
      const idx = state.proxies.findIndex((p) => p.id === id)
      if (idx !== -1) Object.assign(state.proxies[idx], data)
    }),
    setTestResult: (result) => set((state) => { state.lastTestResult = result })
  }))
)
