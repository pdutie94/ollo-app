import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { proxies } from '../db/schema'
import type { Proxy, CreateProxyDTO, UpdateProxyDTO, ProxyTestResult } from '@shared/types'

export function createProxy(data: CreateProxyDTO): Proxy {
  const id = randomUUID()
  const now = new Date()

  getDb().insert(proxies).values({
    id,
    type: data.type,
    host: data.host,
    port: data.port,
    username: data.username ?? null,
    password: data.password ?? null,
    createdAt: now,
    updatedAt: now
  }).run()

  return getProxyById(id)!
}

export function getAllProxies(): Proxy[] {
  return getDb().select().from(proxies).all() as Proxy[]
}

export function getProxyById(id: string): Proxy | undefined {
  const result = getDb().select().from(proxies).where(eq(proxies.id, id)).all()
  return result[0] as Proxy | undefined
}

export function updateProxy(id: string, data: UpdateProxyDTO): Proxy | undefined {
  const existing = getProxyById(id)
  if (!existing) return undefined

  const now = new Date()
  const updateData: Record<string, unknown> = { updatedAt: now }

  if (data.type !== undefined) updateData.type = data.type
  if (data.host !== undefined) updateData.host = data.host
  if (data.port !== undefined) updateData.port = data.port
  if (data.username !== undefined) updateData.username = data.username
  if (data.password !== undefined) updateData.password = data.password

  getDb().update(proxies).set(updateData).where(eq(proxies.id, id)).run()

  return getProxyById(id)
}

export function deleteProxy(id: string): boolean {
  const existing = getProxyById(id)
  if (!existing) return false

  getDb().delete(proxies).where(eq(proxies.id, id)).run()
  return true
}

export async function testProxy(
  proxy: Pick<Proxy, 'type' | 'host' | 'port' | 'username' | 'password'>
): Promise<ProxyTestResult> {
  if (proxy.type === 'socks5') {
    return { success: false, error: 'SOCKS5 test not supported in MVP' }
  }

  try {
    const authStr =
      proxy.username && proxy.password ? `${proxy.username}:${proxy.password}@` : ''
    const proxyUrl = `http://${authStr}${proxy.host}:${proxy.port}`

    const { ProxyAgent } = await import('undici')
    const proxyAgent = new ProxyAgent(proxyUrl)

    const response = await fetch('http://ip-api.com/json', {
      // @ts-expect-error - dispatcher is undici-specific, not in fetch types
      dispatcher: proxyAgent
    })

    if (!response.ok) {
      return { success: false, error: `Proxy returned status ${response.status}` }
    }

    const data = (await response.json()) as { query?: string; country?: string }
    return { success: true, ip: data.query, country: data.country }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
}
