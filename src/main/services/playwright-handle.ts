import { BrowserContext } from 'playwright'
import type { RuntimeHandle } from './browser-runtime'

export class PlaywrightHandle implements RuntimeHandle {
  constructor(
    public readonly profileId: string,
    private readonly context: BrowserContext
  ) {}

  async close(): Promise<void> {
    await this.context.close()
  }

  onClose(callback: () => void): void {
    this.context.on('close', () => {
      callback()
    })
  }
}
