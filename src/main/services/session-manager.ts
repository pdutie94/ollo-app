import { session } from 'electron'
import type { Proxy } from '@shared/types'

function partitionName(profileId: string): string {
  return `persist:profile_${profileId}`
}

export function setProxyForPartition(
  partition: string,
  proxyConfig: Pick<Proxy, 'type' | 'host' | 'port' | 'username' | 'password'>
): Promise<void> {
  const ses = session.fromPartition(partition)

  const proxyRules =
    proxyConfig.type === 'socks5'
      ? `socks5://${proxyConfig.host}:${proxyConfig.port}`
      : `http://${proxyConfig.host}:${proxyConfig.port}`

  const proxyBypassRules = ''

  const proxyConfigStr: Electron.ProxyConfig = {
    mode: 'fixed_servers',
    proxyRules,
    proxyBypassRules
  }

  return ses.setProxy(proxyConfigStr)
}

export function setProxyAuthForPartition(
  partition: string,
  username: string,
  password: string
): void {
  const ses = session.fromPartition(partition)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ses as any).on('login', (_event: any, _request: any, _authInfo: any, callback: any) => {
    callback(username, password)
  })
}

export async function loadExtensionForPartition(
  partition: string,
  extensionPath: string
): Promise<void> {
  const ses = session.fromPartition(partition)
  await ses.loadExtension(extensionPath)
}

export async function setupPartition(
  profileId: string,
  proxy?: Pick<Proxy, 'type' | 'host' | 'port' | 'username' | 'password'> | null,
  extensionPaths?: string[]
): Promise<void> {
  const partition = partitionName(profileId)

  if (proxy) {
    await setProxyForPartition(partition, proxy)

    if (proxy.username && proxy.password) {
      setProxyAuthForPartition(partition, proxy.username, proxy.password)
    }
  }

  if (extensionPaths && extensionPaths.length > 0) {
    for (const extPath of extensionPaths) {
      await loadExtensionForPartition(partition, extPath)
    }
  }
}
