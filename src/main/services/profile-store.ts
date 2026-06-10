import path from 'path'
import { PROFILES_DIR } from '../core/paths'
import fs from 'fs'

export function getUserDataDir(profileId: string): string {
  const dir = path.join(PROFILES_DIR, profileId, 'browser-data')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}
