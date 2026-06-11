import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { CreateProfileDTO, UpdateProfileDTO, CreateProxyDTO, UpdateProxyDTO, CreateGroupDTO, UserSettings, AppExtension, IpcResult, LaunchResult, BrowserEvent } from '@shared/types'

const api = {
  // Profile
  profileCreate: (dto: CreateProfileDTO): Promise<IpcResult> =>
    ipcRenderer.invoke('profile:create', dto),
  profileList: (): Promise<IpcResult> => ipcRenderer.invoke('profile:list'),
  profileGet: (id: string): Promise<IpcResult> => ipcRenderer.invoke('profile:get', id),
  profileUpdate: (id: string, dto: UpdateProfileDTO): Promise<IpcResult> =>
    ipcRenderer.invoke('profile:update', id, dto),
  profileDelete: (id: string): Promise<IpcResult> => ipcRenderer.invoke('profile:delete', id),
  profileBulkDelete: (ids: string[]): Promise<IpcResult> =>
    ipcRenderer.invoke('profile:bulk-delete', ids),

  profileQuery: (params: Record<string, unknown>): Promise<IpcResult> =>
    ipcRenderer.invoke('profile:query', params),

  // Profile launch/stop (real Chrome via Playwright)
  profileLaunch: (profileId: string): Promise<LaunchResult> =>
    ipcRenderer.invoke('profile:launch', profileId),
  profileStop: (profileId: string): Promise<LaunchResult> =>
    ipcRenderer.invoke('profile:stop', profileId),

  // Duplicate
  profileDuplicate: (id: string): Promise<IpcResult> =>
    ipcRenderer.invoke('profile:duplicate', id),

  // Legacy start (uses Playwright launch internally)
  profileStart: (profileId: string): Promise<IpcResult> =>
    ipcRenderer.invoke('profile:start', profileId),

  // Browser event push channel
  onBrowserEvent: (callback: (event: BrowserEvent) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: BrowserEvent): void => callback(data)
    ipcRenderer.on('browser:event', handler)
    return () => ipcRenderer.removeListener('browser:event', handler)
  },

  // Proxy
  proxyCreate: (dto: CreateProxyDTO): Promise<IpcResult> =>
    ipcRenderer.invoke('proxy:create', dto),
  proxyList: (): Promise<IpcResult> => ipcRenderer.invoke('proxy:list'),
  proxyUpdate: (id: string, dto: UpdateProxyDTO): Promise<IpcResult> =>
    ipcRenderer.invoke('proxy:update', id, dto),
  proxyDelete: (id: string): Promise<IpcResult> => ipcRenderer.invoke('proxy:delete', id),
  proxyTest: (proxyData: CreateProxyDTO): Promise<IpcResult> =>
    ipcRenderer.invoke('proxy:test', proxyData),

  // Session
  sessionSetup: (
    profileId: string,
    proxy?: CreateProxyDTO | null,
    extensionPaths?: string[]
  ): Promise<IpcResult> => ipcRenderer.invoke('session:setup', profileId, proxy, extensionPaths),

  // Config
  configExport: (): Promise<IpcResult> => ipcRenderer.invoke('config:export'),
  configImport: (): Promise<IpcResult> => ipcRenderer.invoke('config:import'),
  profileImportFile: (): Promise<IpcResult> => ipcRenderer.invoke('profile:import-file'),

  // Group
  groupCreate: (dto: CreateGroupDTO): Promise<IpcResult> =>
    ipcRenderer.invoke('group:create', dto),
  groupList: (): Promise<IpcResult> => ipcRenderer.invoke('group:list'),
  groupUpdate: (id: string, dto: Partial<CreateGroupDTO>): Promise<IpcResult> =>
    ipcRenderer.invoke('group:update', id, dto),
  groupDelete: (id: string): Promise<IpcResult> => ipcRenderer.invoke('group:delete', id),

  // Settings
  settingsGet: (): Promise<IpcResult> => ipcRenderer.invoke('settings:get'),
  settingsUpdate: (partial: Partial<UserSettings>): Promise<IpcResult> =>
    ipcRenderer.invoke('settings:update', partial),

  // Extension
  extensionList: (): Promise<IpcResult> => ipcRenderer.invoke('extension:list'),
  extensionAdd: (data: Omit<AppExtension, 'id'>): Promise<IpcResult> =>
    ipcRenderer.invoke('extension:add', data),
  extensionRemove: (id: string): Promise<IpcResult> =>
    ipcRenderer.invoke('extension:remove', id),
  extensionToggle: (id: string, enabled: boolean): Promise<IpcResult> =>
    ipcRenderer.invoke('extension:toggle', id, enabled),
  extensionInstallFromUrl: (url: string, name?: string): Promise<IpcResult> =>
    ipcRenderer.invoke('extension:install-from-url', { url, name }),
  extensionInstallFromFile: (): Promise<IpcResult> =>
    ipcRenderer.invoke('extension:install-from-file')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
