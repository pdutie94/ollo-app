import { chromium } from 'playwright'
import type { BrowserRuntime, RuntimeHandle, ProxyLaunchConfig } from './browser-runtime'
import { PlaywrightHandle } from './playwright-handle'

export class PlaywrightRuntime implements BrowserRuntime {
  async launch(profileId: string, userDataDir: string, proxyConfig: ProxyLaunchConfig | null): Promise<RuntimeHandle> {
    const args = [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800'
    ]

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args,
      proxy: proxyConfig
        ? {
            server: proxyConfig.type === 'socks5'
              ? `socks5://${proxyConfig.host}:${proxyConfig.port}`
              : `http://${proxyConfig.host}:${proxyConfig.port}`,
            username: proxyConfig.username ?? undefined,
            password: proxyConfig.password ?? undefined
          }
        : undefined
    })

    return new PlaywrightHandle(profileId, context, context.browser()!)
  }

  async stop(handle: RuntimeHandle): Promise<void> {
    const h = handle as PlaywrightHandle
    await h.close()
  }
}
