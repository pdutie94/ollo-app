import { BrowserContext, Page } from 'playwright'
import type { RuntimeHandle } from './browser-runtime'

export class PlaywrightHandle implements RuntimeHandle {
  private closed = false
  private pageCount = 0
  private idleTimer: ReturnType<typeof setTimeout> | null = null
  private pollTimer: ReturnType<typeof setInterval> | null = null

  constructor(
    public readonly profileId: string,
    private readonly context: BrowserContext
  ) {
    // API close
    this.context.on('close', () => this.notifyClose())

    // Browser disconnect
    const browser = this.context.browser()
    if (browser) {
      browser.on('disconnected', () => this.notifyClose())
    }

    // Track page count — when user closes all tabs manually
    const handlePage = (page: Page) => {
      this.pageCount++
      this.clearIdleTimer()
      page.on('close', () => {
        this.pageCount--
        if (this.pageCount <= 0 && !this.closed) {
          this.idleTimer = setTimeout(() => {
            if (this.pageCount <= 0 && !this.closed) this.notifyClose()
          }, 2000)
        }
      })
    }

    for (const page of this.context.pages()) {
      handlePage(page)
    }

    this.context.on('page', handlePage)

    // Fallback: poll browser.isConnected() every 2s
    this.pollTimer = setInterval(() => {
      if (this.closed) return
      const b = this.context.browser()
      if (b && !b.isConnected()) {
        this.notifyClose()
      }
    }, 2000)
  }

  private notifyClose(): void {
    if (this.closed) return
    this.closed = true
    this.cleanup()
    this.onCloseCallback?.()
  }

  private cleanup(): void {
    this.clearIdleTimer()
    if (this.pollTimer) {
      clearInterval(this.pollTimer)
      this.pollTimer = null
    }
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
  }

  private onCloseCallback: (() => void) | null = null

  async close(): Promise<void> {
    if (this.closed) return
    this.closed = true
    this.cleanup()
    await this.context.close()
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback
  }
}
