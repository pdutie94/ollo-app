import type { RuntimeHandle } from './browser-runtime'
import { eventBus } from '../core/events/event-bus'
import { updateProfile } from './profile-manager'
import { recordEvent } from './event-history'

class ProcessManager {
  private activeHandles = new Map<string, RuntimeHandle>()

  register(handle: RuntimeHandle): void {
    const profileId = handle.profileId
    this.activeHandles.set(profileId, handle)

    handle.onClose(() => {
      if (this.activeHandles.has(profileId)) {
        this.activeHandles.delete(profileId)
        updateProfile(profileId, { status: 'stopped' })
        recordEvent({
          type: 'profile:stopped',
          profileId
        })
        eventBus.emit('profile:stopped', {
          profileId,
          timestamp: new Date().toISOString()
        })
      }
    })
  }

  deregister(profileId: string): void {
    this.activeHandles.delete(profileId)
  }

  getHandle(profileId: string): RuntimeHandle | undefined {
    return this.activeHandles.get(profileId)
  }

  isRunning(profileId: string): boolean {
    return this.activeHandles.has(profileId)
  }

  getRunningIds(): string[] {
    return Array.from(this.activeHandles.keys())
  }
}

export const processManager = new ProcessManager()
