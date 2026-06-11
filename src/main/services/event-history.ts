interface HistoryEvent {
  type: 'profile:started' | 'profile:stopped' | 'profile:created' | 'profile:deleted' | 'profile:error'
  profileId: string
  profileName?: string
  timestamp: string
}

const MAX_EVENTS = 200
const events: HistoryEvent[] = []

export function recordEvent(event: Omit<HistoryEvent, 'timestamp'> & { timestamp?: string }): void {
  events.push({
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString()
  })
  if (events.length > MAX_EVENTS) {
    events.shift()
  }
}

export function getRecentEvents(limit = 20): HistoryEvent[] {
  return events.slice(-limit).reverse()
}

export function getChartBuckets(hours = 24): { time: string; running: number; error: number }[] {
  const now = Date.now()
  const cutoff = now - hours * 3600000
  const buckets: { time: string; running: number; error: number }[] = []

  for (let i = hours; i >= 0; i--) {
    const ts = now - i * 3600000
    const hourLabel = new Date(ts).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    buckets.push({ time: hourLabel, running: 0, error: 0 })
  }

  let running = 0
  for (const evt of events) {
    const t = new Date(evt.timestamp).getTime()
    if (t < cutoff) {
      if (evt.type === 'profile:started' || evt.type === 'profile:created') running++
      else if (evt.type === 'profile:stopped' || evt.type === 'profile:deleted') running--
      continue
    }

    const bucketIndex = Math.floor((t - cutoff) / 3600000)
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      if (evt.type === 'profile:started') {
        buckets[bucketIndex].running++
        running++
      } else if (evt.type === 'profile:stopped') {
        running--
      } else if (evt.type === 'profile:error') {
        buckets[bucketIndex].error++
      }
    }
  }

  return buckets
}
