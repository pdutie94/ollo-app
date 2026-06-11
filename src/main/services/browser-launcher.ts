import type { BrowserRuntime, ProxyLaunchConfig } from './browser-runtime'
import { PlaywrightRuntime } from './playwright-runtime'
import { processManager } from './process-manager'
import { getUserDataDir } from './profile-store'
import { eventBus } from '../core/events/event-bus'
import { recordEvent } from './event-history'
import { getProfileById, updateProfile } from './profile-manager'
import { getProxyById } from './proxy-manager'
import type { Proxy } from '@shared/types'

class BrowserLauncher {
  private runtime: BrowserRuntime

  constructor(runtime: BrowserRuntime = new PlaywrightRuntime()) {
    this.runtime = runtime
  }

  async launch(profileId: string): Promise<{ success: boolean; error?: string }> {
    if (processManager.isRunning(profileId)) {
      return { success: true }
    }

    try {
      const profile = getProfileById(profileId)
      if (!profile) return { success: false, error: 'Profile not found' }

      let proxyConfig: ProxyLaunchConfig | null = null
      if (profile.proxyId) {
        const proxy = getProxyById(profile.proxyId) as Proxy | undefined
        if (proxy) {
          proxyConfig = {
            type: proxy.type,
            host: proxy.host,
            port: proxy.port,
            username: proxy.username,
            password: proxy.password
          }
        }
      }

      const userDataDir = getUserDataDir(profileId)
      // 8.2.2: Pass fingerprint config to runtime
      const handle = await this.runtime.launch(profileId, userDataDir, proxyConfig, profile.fingerprint)
      processManager.register(handle)

      updateProfile(profileId, { status: 'running' })

      eventBus.emit('profile:started', {
        profileId,
        timestamp: new Date().toISOString()
      })

      recordEvent({
        type: 'profile:started',
        profileId,
        profileName: profile.name
      })

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to launch browser'
      recordEvent({ type: 'profile:error', profileId, profileName: getProfileById(profileId)?.name })
      return { success: false, error: message }
    }
  }

  async stop(profileId: string): Promise<void> {
    const handle = processManager.getHandle(profileId)
    if (!handle) return

    try {
      await this.runtime.stop(handle)
    } catch (error: unknown) {
      console.error(`Failed to stop browser for profile ${profileId}:`, error)
    } finally {
      processManager.deregister(profileId)

      eventBus.emit('profile:stopped', {
        profileId,
        timestamp: new Date().toISOString()
      })

      recordEvent({
        type: 'profile:stopped',
        profileId,
        profileName: getProfileById(profileId)?.name
      })

      updateProfile(profileId, { status: 'stopped' })
    }
  }
}

export const browserLauncher = new BrowserLauncher()

