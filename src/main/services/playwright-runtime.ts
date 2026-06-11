import { chromium } from 'playwright'
import type { BrowserRuntime, RuntimeHandle, ProxyLaunchConfig } from './browser-runtime'
import type { ProfileFingerprint } from '@shared/types'
import { PlaywrightHandle } from './playwright-handle'
import { buildFingerprintArgs, getViewportFromResolution } from './fingerprint-applier'
import { buildFingerprintInitScripts } from './fingerprint-scripts'

export class PlaywrightRuntime implements BrowserRuntime {
  async launch(
    profileId: string,
    userDataDir: string,
    proxyConfig: ProxyLaunchConfig | null,
    fingerprint?: ProfileFingerprint | null  // 8.2.2
  ): Promise<RuntimeHandle> {
    const args = [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-infobars',
      '--window-size=1280,800'
    ]

    // 8.2.1 + 8.2.2: Apply fingerprint CLI args
    if (fingerprint) {
      const fpArgs = buildFingerprintArgs(fingerprint)
      args.push(...fpArgs)
    }

    // 8.2.6: Resolution override via viewport
    const viewport = fingerprint ? getViewportFromResolution(fingerprint.resolution) : undefined

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args,
      viewport: viewport ?? { width: 1280, height: 800 },
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

    // 8.2.3 + 8.2.4 + 8.2.5: Inject fingerprint spoofing scripts
    const initScripts = buildFingerprintInitScripts(fingerprint)
    for (const script of initScripts) {
      await context.addInitScript(script)
    }

    return new PlaywrightHandle(profileId, context)
  }

  async stop(handle: RuntimeHandle): Promise<void> {
    const h = handle as PlaywrightHandle
    await h.close()
  }
}
