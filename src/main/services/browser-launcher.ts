import type { BrowserRuntime, ProxyLaunchConfig } from './browser-runtime'
import { PlaywrightRuntime } from './playwright-runtime'
import { processManager } from './process-manager'
import { getUserDataDir } from './profile-store'
import { eventBus } from '../core/events/event-bus'
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
      const handle = await this.runtime.launch(profileId, userDataDir, proxyConfig)
      processManager.register(handle)

      updateProfile(profileId, { status: 'running' })

      eventBus.emit('profile:started', {
        profileId,
        timestamp: new Date().toISOString()
      })

      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to launch browser'
      return { success: false, error: message }
    }
  }

  async stop(profileId: string): Promise<void> {
    const handle = processManager.getHandle(profileId)
    if (!handle) return

    processManager.deregister(profileId)
    await this.runtime.stop(handle)

    eventBus.emit('profile:stopped', {
      profileId,
      timestamp: new Date().toISOString()
    })

    updateProfile(profileId, { status: 'stopped' })
  }
}

export const browserLauncher = new BrowserLauncher()
