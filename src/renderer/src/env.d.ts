/// <reference types="vite/client" />

import type {
  CreateProfileDTO,
  UpdateProfileDTO,
  CreateProxyDTO,
  UpdateProxyDTO,
  CreateGroupDTO,
  UserSettings,
  AppExtension,
  IpcResult,
  LaunchResult,
  BrowserEvent
} from '@shared/types'

declare global {
  interface Window {
    api: {
      profileCreate: (dto: CreateProfileDTO) => Promise<IpcResult>
      profileList: () => Promise<IpcResult>
      profileGet: (id: string) => Promise<IpcResult>
      profileUpdate: (id: string, dto: UpdateProfileDTO) => Promise<IpcResult>
      profileDelete: (id: string) => Promise<IpcResult>
      profileBulkDelete: (ids: string[]) => Promise<IpcResult>
      profileQuery: (params: Record<string, unknown>) => Promise<IpcResult>
      profileLaunch: (profileId: string) => Promise<LaunchResult>
      profileStop: (profileId: string) => Promise<LaunchResult>
      profileDuplicate: (id: string) => Promise<IpcResult>
      profileStart: (profileId: string) => Promise<IpcResult>
      onBrowserEvent: (callback: (event: BrowserEvent) => void) => () => void
      proxyCreate: (dto: CreateProxyDTO) => Promise<IpcResult>
      proxyList: () => Promise<IpcResult>
      proxyUpdate: (id: string, dto: UpdateProxyDTO) => Promise<IpcResult>
      proxyDelete: (id: string) => Promise<IpcResult>
      proxyTest: (proxyData: CreateProxyDTO) => Promise<IpcResult>
      sessionSetup: (profileId: string, proxy?: CreateProxyDTO | null, extensionPaths?: string[]) => Promise<IpcResult>
      configExport: () => Promise<IpcResult>
      configImport: () => Promise<IpcResult>
      profileImportFile: () => Promise<IpcResult>
      eventHistory: (limit?: number) => Promise<IpcResult>
      eventChart: (hours?: number) => Promise<IpcResult>
      errorCount: () => Promise<IpcResult>
      groupCreate: (dto: CreateGroupDTO) => Promise<IpcResult>
      groupList: () => Promise<IpcResult>
      groupUpdate: (id: string, dto: Partial<CreateGroupDTO>) => Promise<IpcResult>
      groupDelete: (id: string) => Promise<IpcResult>
      settingsGet: () => Promise<IpcResult>
      settingsUpdate: (partial: Partial<UserSettings>) => Promise<IpcResult>
      extensionList: () => Promise<IpcResult>
      extensionAdd: (data: Omit<AppExtension, 'id'>) => Promise<IpcResult>
      extensionRemove: (id: string) => Promise<IpcResult>
      extensionToggle: (id: string, enabled: boolean) => Promise<IpcResult>
      extensionInstallFromUrl: (url: string, name?: string) => Promise<IpcResult>
      extensionInstallFromFile: () => Promise<IpcResult>
    }
    electron: unknown
  }
}
