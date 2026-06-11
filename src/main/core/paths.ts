import { app } from 'electron'
import path from 'path'
import fs from 'fs'

const isPackaged = app.isPackaged

export const DATA_ROOT = isPackaged
  ? app.getPath('userData')
  : path.resolve(app.getAppPath(), '..', 'data')

export const PROFILES_DIR = path.join(DATA_ROOT, 'profiles')
export const SETTINGS_FILE = path.join(DATA_ROOT, 'settings.json')
export const LOGS_DIR = path.join(DATA_ROOT, 'logs')
export const DB_PATH = path.join(DATA_ROOT, 'ollo.db')
export const EXTENSIONS_DIR = path.join(DATA_ROOT, 'extensions')

export function ensureDirs(): void {
  for (const dir of [DATA_ROOT, PROFILES_DIR, LOGS_DIR, EXTENSIONS_DIR]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }
}
