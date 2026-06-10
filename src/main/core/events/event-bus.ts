type EventHandler = (...args: unknown[]) => void

class EventBus {
  private handlers = new Map<string, Set<EventHandler>>()

  on(pattern: string, handler: EventHandler): void {
    if (!this.handlers.has(pattern)) {
      this.handlers.set(pattern, new Set())
    }
    this.handlers.get(pattern)!.add(handler)
  }

  off(pattern: string, handler: EventHandler): void {
    this.handlers.get(pattern)?.delete(handler)
  }

  emit(pattern: string, ...args: unknown[]): void {
    const handler = this.handlers.get(pattern)
    if (handler) {
      for (const h of handler) {
        try {
          h(...args)
        } catch (e) {
          console.error(`[EventBus] Error in handler for ${pattern}:`, e)
        }
      }
    }
  }
}

export const eventBus = new EventBus()
