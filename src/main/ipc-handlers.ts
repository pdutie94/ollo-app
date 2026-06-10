import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { createProfile, getAllProfiles, getProfileById, updateProfile, deleteProfile, bulkDeleteProfiles, queryProfiles } from './services/profile-manager'
import { createProxy, getAllProxies, updateProxy, deleteProxy, testProxy } from './services/proxy-manager'
import { createGroup, getAllGroups, updateGroup, deleteGroup } from './services/group-manager'
import { getSettings, updateSettings } from './services/settings-manager'
import { getExtensions, addExtension, removeExtension, toggleExtension } from './services/extension-manager'
import { setupPartition } from './services/session-manager'
import { browserLauncher } from './services/browser-launcher'
import { eventBus } from './core/events/event-bus'
import type { CreateProfileDTO, UpdateProfileDTO, CreateProxyDTO, UpdateProxyDTO, CreateGroupDTO, UserSettings, AppExtension, IpcResult, BrowserEvent, LaunchResult } from '@shared/types'

export function registerIpcHandlers(): void {
  // Profile handlers
  ipcMain.handle('profile:create', (_event, dto: CreateProfileDTO): IpcResult => {
    try {
      const profile = createProfile(dto)
      return { success: true, data: profile }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:query', (_event, params: { search?: string; status?: string; sortBy?: string; sortDir?: 'asc' | 'desc'; page?: number; pageSize?: number }): IpcResult => {
    try {
      const result = queryProfiles(params)
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:list', (): IpcResult => {
    try {
      const profiles = getAllProfiles()
      return { success: true, data: profiles }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:get', (_event, id: string): IpcResult => {
    try {
      const profile = getProfileById(id)
      if (!profile) return { success: false, error: 'Profile not found' }
      return { success: true, data: profile }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:update', (_event, id: string, dto: UpdateProfileDTO): IpcResult => {
    try {
      const profile = updateProfile(id, dto)
      if (!profile) return { success: false, error: 'Profile not found' }
      return { success: true, data: profile }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:delete', (_event, id: string): IpcResult => {
    try {
      const deleted = deleteProfile(id)
      return { success: true, data: deleted }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:bulk-delete', (_event, ids: string[]): IpcResult => {
    try {
      const count = bulkDeleteProfiles(ids)
      return { success: true, data: count }
    } catch (error) {
      return { success: false, error: String(error) }
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
      return { success: false, error: String(error) }
    }
  })

  // Profile launch/stop via Playwright (real Chrome)
  ipcMain.handle('profile:launch', async (_event, profileId: string): Promise<LaunchResult> => {
    try {
      return await browserLauncher.launch(profileId)
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('profile:stop', async (_event, profileId: string): Promise<LaunchResult> => {
    try {
      await browserLauncher.stop(profileId)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // Legacy webview-based start (keep for backward compat, delegates to profile:launch)
  ipcMain.handle('profile:start', async (_event, profileId: string): Promise<IpcResult> => {
    try {
      const result = await browserLauncher.launch(profileId)
      return { success: result.success, error: result.error }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // Proxy handlers
  ipcMain.handle('proxy:create', (_event, dto: CreateProxyDTO): IpcResult => {
    try {
      const proxy = createProxy(dto)
      return { success: true, data: proxy }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('proxy:list', (): IpcResult => {
    try {
      const proxies = getAllProxies()
      return { success: true, data: proxies }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('proxy:update', (_event, id: string, dto: UpdateProxyDTO): IpcResult => {
    try {
      const proxy = updateProxy(id, dto)
      if (!proxy) return { success: false, error: 'Proxy not found' }
      return { success: true, data: proxy }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('proxy:delete', (_event, id: string): IpcResult => {
    try {
      const deleted = deleteProxy(id)
      return { success: true, data: deleted }
    } catch (error) {
      return { success: false, error: String(error) }
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
      return { success: false, error: String(error) }
    }
  })

  // Group handlers
  ipcMain.handle('group:create', (_event, dto: CreateGroupDTO): IpcResult => {
    try {
      const group = createGroup(dto)
      return { success: true, data: group }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('group:list', (): IpcResult => {
    try {
      const groups = getAllGroups()
      return { success: true, data: groups }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('group:update', (_event, id: string, dto: Partial<CreateGroupDTO>): IpcResult => {
    try {
      const group = updateGroup(id, dto)
      if (!group) return { success: false, error: 'Group not found' }
      return { success: true, data: group }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('group:delete', (_event, id: string): IpcResult => {
    try {
      const deleted = deleteGroup(id)
      return { success: true, data: deleted }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // Settings handlers
  ipcMain.handle('settings:get', (): IpcResult => {
    try {
      const settings = getSettings()
      return { success: true, data: settings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('settings:update', (_event, partial: Partial<UserSettings>): IpcResult => {
    try {
      const settings = updateSettings(partial)
      if (!settings) return { success: false, error: 'Settings not found' }
      return { success: true, data: settings }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // Extension handlers
  ipcMain.handle('extension:list', (): IpcResult => {
    try {
      const extensions = getExtensions()
      return { success: true, data: extensions }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('extension:add', (_event, data: Omit<AppExtension, 'id'>): IpcResult => {
    try {
      const ext = addExtension(data)
      return { success: true, data: ext }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('extension:remove', (_event, id: string): IpcResult => {
    try {
      const removed = removeExtension(id)
      return { success: true, data: removed }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('extension:toggle', (_event, id: string, enabled: boolean): IpcResult => {
    try {
      const ext = toggleExtension(id, enabled)
      if (!ext) return { success: false, error: 'Extension not found' }
      return { success: true, data: ext }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  // Session handler (webview-based, keep for settings)
  ipcMain.handle('session:setup', async (_event, profileId: string, proxy?: CreateProxyDTO | null, extensionPaths?: string[]): Promise<IpcResult> => {
    try {
      const normalizedProxy = proxy
        ? { ...proxy, username: proxy.username ?? null, password: proxy.password ?? null }
        : null
      await setupPartition(profileId, normalizedProxy, extensionPaths)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

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
      return { success: false, error: String(error) }
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
      return { success: false, error: String(error) }
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
