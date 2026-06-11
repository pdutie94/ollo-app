import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFileSync, writeFileSync, existsSync, copyFileSync, statSync } from 'fs'
import { extname, join, basename } from 'path'
import { EXTENSIONS_DIR } from './core/paths'
import {
  createProfile,
  getAllProfiles,
  getProfileById,
  updateProfile,
  deleteProfile,
  bulkDeleteProfiles,
  queryProfiles
} from './services/profile-manager'
import {
  createProxy,
  getAllProxies,
  updateProxy,
  deleteProxy,
  testProxy
} from './services/proxy-manager'
import { createGroup, getAllGroups, updateGroup, deleteGroup } from './services/group-manager'
import { getSettings, updateSettings } from './services/settings-manager'
import {
  getExtensions,
  addExtension,
  removeExtension,
  toggleExtension,
  updateExtensionInstallPath,
  getExtensionById
} from './services/extension-manager'
import { getRecentEvents, getChartBuckets } from './services/event-history'
import { getErrorCount } from './core/errors/errorLogger'
import { setupPartition } from './services/session-manager'
import { browserLauncher } from './services/browser-launcher'
import { eventBus } from './core/events/event-bus'
import { logError } from './core/errors/errorLogger'
import type {
  CreateProfileDTO,
  UpdateProfileDTO,
  CreateProxyDTO,
  UpdateProxyDTO,
  CreateGroupDTO,
  UserSettings,
  AppExtension,
  IpcResult,
  BrowserEvent,
  LaunchResult
} from '@shared/types'

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Extract a CRX file into a target directory, skipping the Cr24 header if present.
 */
async function extractCrxToDir(crxPath: string, targetDir: string): Promise<void> {
  const AdmZip = (await import('adm-zip')).default

  if (!existsSync(targetDir)) {
    const { mkdirSync } = await import('fs')
    mkdirSync(targetDir, { recursive: true })
  }

  const raw = readFileSync(crxPath)

  // CRX v2 header: "Cr24" (4 bytes) + version (4 bytes) + public key length (4 bytes) + signature length (4 bytes)
  // CRX v3 header: "Cr24" (4 bytes) + version (4 bytes) + header length (4 bytes)
  let zipStart = 0
  const magic = raw.toString('utf8', 0, 4)
  if (magic === 'Cr24') {
    const version = raw.readUInt32LE(4)
    if (version === 2) {
      const pubKeyLen = raw.readUInt32LE(8)
      const sigLen = raw.readUInt32LE(12)
      zipStart = 16 + pubKeyLen + sigLen
    } else if (version === 3) {
      const headerLen = raw.readUInt32LE(8)
      zipStart = 12 + headerLen
    } else {
      zipStart = 16 // fallback
    }
  }

  const zipBuffer = raw.subarray(zipStart)
  const zip = new AdmZip(zipBuffer)
  zip.extractAllTo(targetDir, true)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function registerIpcHandlers(): void {
  // Profile handlers
  ipcMain.handle('profile:create', (_event, dto: CreateProfileDTO): IpcResult => {
    try {
      const profile = createProfile(dto)
      return { success: true, data: profile }
    } catch (error) {
      logError(error, 'profile:create')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle(
    'profile:query',
    (
      _event,
      params: {
        search?: string
        status?: string
        sortBy?: string
        sortDir?: 'asc' | 'desc'
        page?: number
        pageSize?: number
      }
    ): IpcResult => {
      try {
        const result = queryProfiles(params)
        return { success: true, data: result }
      } catch (error) {
        logError(error, 'profile:query')
        return { success: false, error: toErrorMessage(error) }
      }
    }
  )

  ipcMain.handle('profile:list', (): IpcResult => {
    try {
      const profiles = getAllProfiles()
      return { success: true, data: profiles }
    } catch (error) {
      logError(error, 'profile:list')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('profile:get', (_event, id: string): IpcResult => {
    try {
      const profile = getProfileById(id)
      if (!profile) return { success: false, error: 'Profile not found' }
      return { success: true, data: profile }
    } catch (error) {
      logError(error, 'profile:get')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('profile:update', (_event, id: string, dto: UpdateProfileDTO): IpcResult => {
    try {
      const profile = updateProfile(id, dto)
      if (!profile) return { success: false, error: 'Profile not found' }
      return { success: true, data: profile }
    } catch (error) {
      logError(error, 'profile:update')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('profile:delete', (_event, id: string): IpcResult => {
    try {
      const deleted = deleteProfile(id)
      return { success: true, data: deleted }
    } catch (error) {
      logError(error, 'profile:delete')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('profile:bulk-delete', (_event, ids: string[]): IpcResult => {
    try {
      const count = bulkDeleteProfiles(ids)
      return { success: true, data: count }
    } catch (error) {
      logError(error, 'profile:bulk-delete')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('profile:duplicate', (_event, id: string): IpcResult => {
    try {
      const original = getProfileById(id)
      if (!original) return { success: false, error: 'Profile not found' }
      const { id: _, createdAt: _c, updatedAt: _u, ...rest } = original
      const duplicate = createProfile({
        name: `${rest.name} (sao chép)`,
        notes: rest.notes ?? undefined,
        groupId: rest.groupId ?? undefined,
        proxyId: rest.proxyId ?? undefined,
        userAgent: rest.userAgent ?? undefined,
        tags: rest.tags
      })
      return { success: true, data: duplicate }
    } catch (error) {
      logError(error, 'profile:duplicate')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Profile launch/stop via Playwright (real Chrome)
  ipcMain.handle('profile:launch', async (_event, profileId: string): Promise<LaunchResult> => {
    try {
      return await browserLauncher.launch(profileId)
    } catch (error) {
      logError(error, 'profile:launch')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('profile:stop', async (_event, profileId: string): Promise<LaunchResult> => {
    try {
      await browserLauncher.stop(profileId)
      return { success: true }
    } catch (error) {
      logError(error, 'profile:stop')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Legacy webview-based start (keep for backward compat, delegates to profile:launch)
  ipcMain.handle('profile:start', async (_event, profileId: string): Promise<IpcResult> => {
    try {
      const result = await browserLauncher.launch(profileId)
      return { success: result.success, error: result.error }
    } catch (error) {
      logError(error, 'profile:start')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Proxy handlers
  ipcMain.handle('proxy:create', (_event, dto: CreateProxyDTO): IpcResult => {
    try {
      const proxy = createProxy(dto)
      return { success: true, data: proxy }
    } catch (error) {
      logError(error, 'proxy:create')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('proxy:list', (): IpcResult => {
    try {
      const proxies = getAllProxies()
      return { success: true, data: proxies }
    } catch (error) {
      logError(error, 'proxy:list')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('proxy:update', (_event, id: string, dto: UpdateProxyDTO): IpcResult => {
    try {
      const proxy = updateProxy(id, dto)
      if (!proxy) return { success: false, error: 'Proxy not found' }
      return { success: true, data: proxy }
    } catch (error) {
      logError(error, 'proxy:update')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('proxy:delete', (_event, id: string): IpcResult => {
    try {
      const deleted = deleteProxy(id)
      return { success: true, data: deleted }
    } catch (error) {
      logError(error, 'proxy:delete')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('proxy:test', async (_event, proxyData: CreateProxyDTO): Promise<IpcResult> => {
    try {
      const result = await testProxy({
        ...proxyData,
        username: proxyData.username ?? null,
        password: proxyData.password ?? null
      })
      return { success: true, data: result }
    } catch (error) {
      logError(error, 'proxy:test')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Group handlers
  ipcMain.handle('group:create', (_event, dto: CreateGroupDTO): IpcResult => {
    try {
      const group = createGroup(dto)
      return { success: true, data: group }
    } catch (error) {
      logError(error, 'group:create')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('group:list', (): IpcResult => {
    try {
      const groups = getAllGroups()
      return { success: true, data: groups }
    } catch (error) {
      logError(error, 'group:list')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('group:update', (_event, id: string, dto: Partial<CreateGroupDTO>): IpcResult => {
    try {
      const group = updateGroup(id, dto)
      if (!group) return { success: false, error: 'Group not found' }
      return { success: true, data: group }
    } catch (error) {
      logError(error, 'group:update')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('group:delete', (_event, id: string): IpcResult => {
    try {
      const deleted = deleteGroup(id)
      return { success: true, data: deleted }
    } catch (error) {
      logError(error, 'group:delete')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Settings handlers
  ipcMain.handle('settings:get', (): IpcResult => {
    try {
      const settings = getSettings()
      return { success: true, data: settings }
    } catch (error) {
      logError(error, 'settings:get')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('settings:update', (_event, partial: Partial<UserSettings>): IpcResult => {
    try {
      const settings = updateSettings(partial)
      if (!settings) return { success: false, error: 'Settings not found' }
      return { success: true, data: settings }
    } catch (error) {
      logError(error, 'settings:update')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Extension handlers
  ipcMain.handle('extension:list', (): IpcResult => {
    try {
      const extensions = getExtensions()
      return { success: true, data: extensions }
    } catch (error) {
      logError(error, 'extension:list')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('extension:add', (_event, data: Omit<AppExtension, 'id'>): IpcResult => {
    try {
      const ext = addExtension(data)
      return { success: true, data: ext }
    } catch (error) {
      logError(error, 'extension:add')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('extension:remove', (_event, id: string): IpcResult => {
    try {
      const removed = removeExtension(id)
      return { success: true, data: removed }
    } catch (error) {
      logError(error, 'extension:remove')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('extension:toggle', (_event, id: string, enabled: boolean): IpcResult => {
    try {
      const ext = toggleExtension(id, enabled)
      if (!ext) return { success: false, error: 'Extension not found' }
      return { success: true, data: ext }
    } catch (error) {
      logError(error, 'extension:toggle')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Session handler (webview-based, keep for settings)
  ipcMain.handle(
    'session:setup',
    async (
      _event,
      profileId: string,
      proxy?: CreateProxyDTO | null,
      extensionPaths?: string[]
    ): Promise<IpcResult> => {
      try {
        const normalizedProxy = proxy
          ? { ...proxy, username: proxy.username ?? null, password: proxy.password ?? null }
          : null
        await setupPartition(profileId, normalizedProxy, extensionPaths)
        return { success: true }
      } catch (error) {
        logError(error, 'session:setup')
        return { success: false, error: toErrorMessage(error) }
      }
    }
  )

  // Config export/import
  ipcMain.handle('config:export', async (): Promise<IpcResult> => {
    try {
      const profiles = getAllProfiles()
      const proxies = getAllProxies()
      const groups = getAllGroups()

      const { canceled, filePath } = await dialog.showSaveDialog({
        defaultPath: 'ollo-config.json',
        filters: [{ name: 'JSON', extensions: ['json'] }]
      })

      if (canceled || !filePath) return { success: false, error: 'Export cancelled' }

      writeFileSync(filePath, JSON.stringify({ profiles, proxies, groups }, null, 2), 'utf-8')
      return { success: true }
    } catch (error) {
      logError(error, 'config:export')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('config:import', async (): Promise<IpcResult> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'JSON', extensions: ['json'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return { success: false, error: 'Import cancelled' }

      const content = readFileSync(filePaths[0], 'utf-8')
      const data = JSON.parse(content)

      if (data.profiles) {
        for (const profile of data.profiles) {
          const { id: _, createdAt: _c, updatedAt: _u, ...rest } = profile
          createProfile(rest)
        }
      }

      if (data.proxies) {
        for (const proxy of data.proxies) {
          const { id: _, createdAt: _c, updatedAt: _u, ...rest } = proxy
          createProxy(rest)
        }
      }

      if (data.groups) {
        for (const group of data.groups) {
          const { id: _, createdAt: _c, updatedAt: _u, ...rest } = group
          createGroup(rest)
        }
      }

      return { success: true }
    } catch (error) {
      logError(error, 'config:import')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Batch import profiles from CSV/JSON file
  ipcMain.handle('profile:import-file', async (): Promise<IpcResult> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'CSV/JSON', extensions: ['csv', 'json', 'txt'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return { success: false, error: 'Import cancelled' }

      const content = readFileSync(filePaths[0], 'utf-8')
      const ext = filePaths[0].split('.').pop()?.toLowerCase()
      let imported: { name: string; notes?: string; groupId?: string }[] = []

      if (ext === 'json') {
        const data = JSON.parse(content)
        const arr = Array.isArray(data) ? data : data.profiles || data.data || [data]
        imported = arr
      } else {
        // CSV/TXT — parse as comma/tab separated
        const lines = content.split('\n').filter((l) => l.trim())
        if (lines.length > 0) {
          const header = lines[0]
            .toLowerCase()
            .replace(/["']/g, '')
            .split(/[,;\t]/)
            .map((h) => h.trim())
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i]
              .replace(/["']/g, '')
              .split(/[,;\t]/)
              .map((v) => v.trim())
            const row: Record<string, string> = {}
            header.forEach((h, j) => {
              row[h] = vals[j] || ''
            })
            if (row['name']) {
              imported.push({
                name: row['name'],
                notes: row['notes'] || row['note'],
                groupId: row['group_id'] || row['groupid'] || row['group']
              })
            }
          }
        }
      }

      let count = 0
      for (const item of imported) {
        if (item.name) {
          createProfile({
            name: String(item.name),
            notes: item.notes ? String(item.notes) : undefined,
            groupId: item.groupId ? String(item.groupId) : undefined
          })
          count++
        }
      }

      return { success: true, data: { count } }
    } catch (error) {
      logError(error, 'profile:import-file')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Extension install from URL
  ipcMain.handle(
    'extension:install-from-url',
    async (_event, { url, name }: { url: string; name?: string }): Promise<IpcResult> => {
      try {
        const fileName = name
          ? `${name.replace(/[^a-zA-Z0-9]/g, '_')}.crx`
          : `ext_${Date.now()}.crx`
        const tempPath = join(EXTENSIONS_DIR, fileName)

        const response = await fetch(url)
        if (!response.ok) return { success: false, error: `Download failed: ${response.status}` }
        const buffer = Buffer.from(await response.arrayBuffer())
        writeFileSync(tempPath, buffer)

        const ext = addExtension({
          name: name || `Extension ${Date.now().toString(36)}`,
          version: '1.0.0',
          description: '',
          icon: '🧩',
          enabled: true
        })

        // Extract CRX into organized directory
        const extDir = join(EXTENSIONS_DIR, ext.id)
        try {
          await extractCrxToDir(tempPath, extDir)
          updateExtensionInstallPath(ext.id, extDir)
        } catch (extractError) {
          console.error('Failed to extract CRX, storing flat file path:', extractError)
          updateExtensionInstallPath(ext.id, tempPath)
        }

        return { success: true, data: ext }
      } catch (error) {
        logError(error, 'extension:install-from-url')
        return { success: false, error: toErrorMessage(error) }
      }
    }
  )

  // Extension install from file
  ipcMain.handle('extension:install-from-file', async (): Promise<IpcResult> => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        filters: [{ name: 'Extensions', extensions: ['crx', 'xpi', 'zip'] }],
        properties: ['openFile']
      })

      if (canceled || filePaths.length === 0) return { success: false, error: 'Cancelled' }

      const srcPath = filePaths[0]
      const destName = `ext_${Date.now()}_${basename(srcPath)}`
      const tempPath = join(EXTENSIONS_DIR, destName)
      copyFileSync(srcPath, tempPath)

      const ext = addExtension({
        name: basename(srcPath, extname(srcPath)),
        version: '1.0.0',
        description: '',
        icon: '📦',
        enabled: true
      })

      // Extract CRX/ZIP into organized directory
      const extDir = join(EXTENSIONS_DIR, ext.id)
      try {
        await extractCrxToDir(tempPath, extDir)
        updateExtensionInstallPath(ext.id, extDir)
      } catch (extractError) {
        console.error('Failed to extract, storing flat file path:', extractError)
        updateExtensionInstallPath(ext.id, tempPath)
      }

      return { success: true, data: ext }
    } catch (error) {
      logError(error, 'extension:install-from-file')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Extension size (9.3.1)
  ipcMain.handle('extension:size', async (_event, id: string): Promise<IpcResult> => {
    try {
      const ext = getExtensionById(id)
      if (!ext || !ext.installPath) return { success: true, data: { size: 0, formatted: '—' } }

      let totalBytes = 0
      const { readdirSync } = await import('fs')
      const { join: pathJoin } = await import('path')
      const walkDir = (dir: string): void => {
        const entries = readdirSync(dir)
        for (const entry of entries) {
          const fullPath = pathJoin(dir, entry)
          const stat = statSync(fullPath)
          if (stat.isDirectory()) {
            walkDir(fullPath)
          } else {
            totalBytes += stat.size
          }
        }
      }

      try {
        walkDir(ext.installPath)
      } catch {
        // If directory walk fails, try stat on single file
        try {
          totalBytes = statSync(ext.installPath).size
        } catch {
          totalBytes = 0
        }
      }

      return { success: true, data: { size: totalBytes, formatted: formatFileSize(totalBytes) } }
    } catch (error) {
      logError(error, 'extension:size')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Event history (for dashboard)
  ipcMain.handle('event:history', (_event, limit = 20): IpcResult => {
    try {
      const events = getRecentEvents(limit)
      return { success: true, data: events }
    } catch (error) {
      logError(error, 'event:history')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('event:chart', (_event, hours = 24): IpcResult => {
    try {
      const buckets = getChartBuckets(hours)
      return { success: true, data: buckets }
    } catch (error) {
      logError(error, 'event:chart')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  ipcMain.handle('error:count', (): IpcResult => {
    try {
      return { success: true, data: { count: getErrorCount() } }
    } catch (error) {
      logError(error, 'error:count')
      return { success: false, error: toErrorMessage(error) }
    }
  })

  // Browser event push channel (main → renderer)
  eventBus.on('profile:started', (event: unknown) => {
    const browserEvent = event as BrowserEvent
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('browser:event', browserEvent)
      }
    }
  })

  eventBus.on('profile:stopped', (event: unknown) => {
    const browserEvent = event as BrowserEvent
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('browser:event', browserEvent)
      }
    }
  })
}
