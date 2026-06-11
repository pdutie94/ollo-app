import { BrowserContext, Page } from 'playwright'
import type { RuntimeHandle } from './browser-runtime'

export class PlaywrightHandle implements RuntimeHandle {
  private closed = false
  private nonEmptyPageCount = 0
  private idleTimer: ReturnType<typeof setTimeout> | null = null

  constructor(
    public readonly profileId: string,
    private readonly context: BrowserContext
  ) {
    console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] Created, tracking pages`)

    // API close
    this.context.on('close', () => {
      console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] context.on('close')`)
      this.notifyClose()
    })

    // Browser disconnected
    const browser = this.context.browser()
    if (browser) {
      browser.on('disconnected', () => {
        console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] browser.on('disconnected')`)
        this.notifyClose()
      })
    }

    const isNonEmptyPage = (p: Page) => {
      try {
        const url = p.url()
        return url && url !== 'about:blank' && !url.startsWith('chrome://')
      } catch { return false }
    }

    const handlePage = (page: Page) => {
      if (isNonEmptyPage(page)) {
        this.nonEmptyPageCount++
        console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] Page opened (${page.url().slice(0,40)}), count=${this.nonEmptyPageCount}`)
      } else {
        console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] Blank page opened, ignoring`)
      }
      this.clearIdleTimer()
      page.on('close', () => {
        if (isNonEmptyPage(page)) {
          this.nonEmptyPageCount--
          console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] Page closed, count=${this.nonEmptyPageCount}`)
        }
        if (this.nonEmptyPageCount <= 0 && !this.closed) {
          this.idleTimer = setTimeout(() => {
            if (this.nonEmptyPageCount <= 0 && !this.closed) {
              console.log(`[PlaywrightHandle:${profileId.slice(0,8)}] All pages closed, notifying`)
              this.notifyClose()
            }
          }, 2000)
        }
      })
    }

    for (const page of this.context.pages()) {
      handlePage(page)
    }

    this.context.on('page', handlePage)
  }

  private notifyClose(): void {
    if (this.closed) return
    console.log(`[PlaywrightHandle:${this.profileId.slice(0,8)}] notifyClose triggered`)
    this.closed = true
    this.cleanup()
    this.onCloseCallback?.()
  }

  private cleanup(): void {
    this.clearIdleTimer()
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
