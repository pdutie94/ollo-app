export type ProxyType = 'http' | 'https' | 'socks5'

export type ProfileStatus = 'running' | 'stopped'

export interface Profile {
  id: string
  name: string
  notes: string | null
  groupId: string | null
  proxyId: string | null
  userAgent: string | null
  tags: string[]
  status: ProfileStatus
  createdAt: Date
  updatedAt: Date
}

export interface CreateProfileDTO {
  name: string
  notes?: string
  groupId?: string
  proxyId?: string
  userAgent?: string
  tags?: string[]
}

export interface UpdateProfileDTO extends Partial<CreateProfileDTO> {
  status?: ProfileStatus
}

export interface Proxy {
  id: string
  type: ProxyType
  host: string
  port: number
  username: string | null
  password: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateProxyDTO {
  type: ProxyType
  host: string
  port: number
  username?: string
  password?: string
}

export interface UpdateProxyDTO extends Partial<CreateProxyDTO> {}

export interface Group {
  id: string
  name: string
  color: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateGroupDTO {
  name: string
  color?: string
}

export interface UserSettings {
  // General
  userName?: string
  userPlan?: string
  defaultWorkspace: string
  language: string
  autoSave: boolean
  startWithSystem: boolean
  minimizeToTray: boolean
  checkUpdates: boolean
  telemetry: boolean
  // Browser Engine
  defaultBrowser: string
  maxConcurrentProfiles: number
  browserCache: boolean
  gpuAcceleration: boolean
  sandboxMode: boolean
  debugPort: number
  // Fingerprint
  defaultOS: string
  canvasSpoofing: boolean
  webglSpoofing: boolean
  audioSpoofing: boolean
  webrtcProtection: boolean
  fontFingerprintGuard: boolean
  autoTimezone: boolean
  defaultResolution: string
  // Security
  profileEncryption: boolean
  masterPassword: boolean
  autoLockTimeout: string
  auditLogging: boolean
  twoFactorAuth: boolean
  // API
  apiKey: string
  apiAccess: boolean
  webhookUrl: string
  rateLimit: number
  ipAllowlist: boolean
}

export const defaultSettings: UserSettings = {
  defaultWorkspace: 'Workspace Alpha',
  language: 'Tiếng Việt',
  autoSave: true,
  startWithSystem: false,
  minimizeToTray: true,
  checkUpdates: true,
  telemetry: false,
  defaultBrowser: 'Chromium (Mới nhất)',
  maxConcurrentProfiles: 50,
  browserCache: true,
  gpuAcceleration: true,
  sandboxMode: true,
  debugPort: 9222,
  defaultOS: 'Windows 11',
  canvasSpoofing: true,
  webglSpoofing: true,
  audioSpoofing: true,
  webrtcProtection: true,
  fontFingerprintGuard: false,
  autoTimezone: true,
  defaultResolution: '1920×1080',
  profileEncryption: true,
  masterPassword: false,
  autoLockTimeout: 'Không',
  auditLogging: true,
  twoFactorAuth: false,
  apiKey: '',
  apiAccess: true,
  webhookUrl: '',
  rateLimit: 300,
  ipAllowlist: false
}

export interface Settings {
  id: string
  data: UserSettings
  extensions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ProxyTestResult {
  success: boolean
  ip?: string
  country?: string
  error?: string
}

export interface IpcResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

export interface BrowserEvent {
  type: 'profile:started' | 'profile:stopped'
  profileId: string
  timestamp: string
}

export interface LaunchResult {
  success: boolean
  error?: string
}

export interface AppExtension {
  id: string
  name: string
  version: string
  description: string
  icon: string
  enabled: boolean
}
