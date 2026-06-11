import { existsSync } from 'fs'
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
    fingerprint?: ProfileFingerprint | null,
    extensionPaths?: string[]
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

    // 9.2.2 + 9.2.3: Load extensions via CLI args
    if (extensionPaths && extensionPaths.length > 0) {
      const validPaths = extensionPaths.filter((p) => existsSync(p))
      if (validPaths.length > 0) {
        args.push(`--load-extension=${validPaths.join(',')}`)
        args.push(`--disable-extensions-except=${validPaths.join(',')}`)
        console.log(`[PlaywrightRuntime] Loading extensions:`, validPaths)
      } else {
        console.warn(`[PlaywrightRuntime] No valid extension paths found from:`, extensionPaths)
      }
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

    // 9.2.4: Verify extensions loaded
    if (extensionPaths && extensionPaths.length > 0) {
      try {
        const pages = context.pages()
        if (pages.length > 0) {
          const loaded = await pages[0].evaluate(() => {
            try {
              // @ts-ignore chrome.runtime is available in extension context
              return chrome?.runtime?.id ? true : false
            } catch { return false }
          }).catch(() => false)
          console.log(`[PlaywrightRuntime] Extension context verified: ${loaded}`)
        }
      } catch (e) {
        console.warn('[PlaywrightRuntime] Could not verify extensions:', e)
      }
    }

    return new PlaywrightHandle(profileId, context)
  }

  async stop(handle: RuntimeHandle): Promise<void> {
    const h = handle as PlaywrightHandle
    await h.close()
  }
}
