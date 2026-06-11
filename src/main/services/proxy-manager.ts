import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { proxies } from '../db/schema'
import type { Proxy, CreateProxyDTO, UpdateProxyDTO, ProxyTestResult } from '@shared/types'

export function createProxy(data: CreateProxyDTO): Proxy {
  try {
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
  } catch (error) {
    console.error('proxy-manager.createProxy:', error)
    throw error
  }
}

export function getAllProxies(): Proxy[] {
  try {
    return getDb().select().from(proxies).all() as Proxy[]
  } catch (error) {
    console.error('proxy-manager.getAllProxies:', error)
    throw error
  }
}

export function getProxyById(id: string): Proxy | undefined {
  try {
    const result = getDb().select().from(proxies).where(eq(proxies.id, id)).all()
    return result[0] as Proxy | undefined
  } catch (error) {
    console.error('proxy-manager.getProxyById:', error)
    throw error
  }
}

export function updateProxy(id: string, data: UpdateProxyDTO): Proxy | undefined {
  try {
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
  } catch (error) {
    console.error('proxy-manager.updateProxy:', error)
    throw error
  }
}

export function deleteProxy(id: string): boolean {
  try {
    const existing = getProxyById(id)
    if (!existing) return false

    getDb().delete(proxies).where(eq(proxies.id, id)).run()
    return true
  } catch (error) {
    console.error('proxy-manager.deleteProxy:', error)
    throw error
  }
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
