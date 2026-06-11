import type { ProfileFingerprint } from '@shared/types'

export interface RuntimeHandle {
  readonly profileId: string
  onClose(callback: () => void): void
}

export interface BrowserRuntime {
  launch(
    profileId: string,
    userDataDir: string,
    proxyConfig: ProxyLaunchConfig | null,
    fingerprint?: ProfileFingerprint | null  // 8.2.2
  ): Promise<RuntimeHandle>
  stop(handle: RuntimeHandle): Promise<void>
}

export interface ProxyLaunchConfig {
  type: 'http' | 'https' | 'socks5'
  host: string
  port: number
  username: string | null
  password: string | null
}
