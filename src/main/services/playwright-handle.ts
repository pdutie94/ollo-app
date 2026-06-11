import { BrowserContext, Browser } from 'playwright'
import type { RuntimeHandle } from './browser-runtime'

export class PlaywrightHandle implements RuntimeHandle {
  private closed = false

  constructor(
    public readonly profileId: string,
    private readonly context: BrowserContext,
    browser: Browser
  ) {
    const notifyClose = () => {
      if (this.closed) return
      this.closed = true
      this.onCloseCallback?.()
    }

    // context.on('close') fires when closed via API
    this.context.on('close', notifyClose)

    // browser.on('disconnected') fires when user closes Chrome window manually
    browser.on('disconnected', notifyClose)
  }

  private onCloseCallback: (() => void) | null = null

  async close(): Promise<void> {
    if (this.closed) return
    this.closed = true
    await this.context.close()
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback
  }
}
