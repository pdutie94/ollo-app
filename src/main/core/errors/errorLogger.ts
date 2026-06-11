import { appendFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { LOGS_DIR } from '../paths'

interface ErrorLogEntry {
  timestamp: string
  channel?: string
  message: string
  stack?: string
}

function ensureLogsDir(): void {
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true })
  }
}

function formatDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let errorCount = 0

export function logError(error: unknown, channel?: string): void {
  try {
    ensureLogsDir()
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      channel,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }
    const logPath = join(LOGS_DIR, `error-${formatDate()}.log`)
    appendFileSync(logPath, JSON.stringify(entry) + '\n', 'utf-8')
    errorCount++
  } catch {
    // Silently fail — cannot log the error logger's own error
  }
}

export function getErrorCount(): number {
  return errorCount
}

export function resetErrorCount(): void {
  errorCount = 0
}
