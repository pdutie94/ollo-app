import { randomUUID } from 'crypto'
import { eq, inArray } from 'drizzle-orm'
import { getDb } from '../db'
import { profiles } from '../db/schema'
import type { Profile, CreateProfileDTO, UpdateProfileDTO } from '@shared/types'

export function createProfile(data: CreateProfileDTO): Profile {
  try {
    const id = randomUUID()
    const now = new Date()

    getDb().insert(profiles).values({
      id,
      name: data.name,
      notes: data.notes ?? null,
      groupId: data.groupId ?? null,
      proxyId: data.proxyId ?? null,
      userAgent: data.userAgent ?? null,
      tags: data.tags ?? [],
      fingerprint: data.fingerprint ?? null,  // 8.1.2
      status: 'stopped',
      createdAt: now,
      updatedAt: now
    }).run()

    return getProfileById(id)!
  } catch (error) {
    console.error('profile-manager.createProfile:', error)
    throw error
  }
}

export function getAllProfiles(): Profile[] {
  try {
    return getDb().select().from(profiles).all() as Profile[]
  } catch (error) {
    console.error('profile-manager.getAllProfiles:', error)
    throw error
  }
}

export function getProfileById(id: string): Profile | undefined {
  try {
    const result = getDb().select().from(profiles).where(eq(profiles.id, id)).all()
    return result[0] as Profile | undefined
  } catch (error) {
    console.error('profile-manager.getProfileById:', error)
    throw error
  }
}

export function updateProfile(id: string, data: UpdateProfileDTO): Profile | undefined {
  try {
    const existing = getProfileById(id)
    if (!existing) return undefined

    const now = new Date()
    const updateData: Record<string, unknown> = { updatedAt: now }

    if (data.name !== undefined) updateData.name = data.name
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.groupId !== undefined) updateData.groupId = data.groupId
    if (data.proxyId !== undefined) updateData.proxyId = data.proxyId
    if (data.userAgent !== undefined) updateData.userAgent = data.userAgent
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.fingerprint !== undefined) updateData.fingerprint = data.fingerprint  // 8.1.2
    if (data.status !== undefined) updateData.status = data.status

    getDb().update(profiles).set(updateData).where(eq(profiles.id, id)).run()

    return getProfileById(id)
  } catch (error) {
    console.error('profile-manager.updateProfile:', error)
    throw error
  }
}

export function deleteProfile(id: string): boolean {
  try {
    const existing = getProfileById(id)
    if (!existing) return false

    getDb().delete(profiles).where(eq(profiles.id, id)).run()
    return true
  } catch (error) {
    console.error('profile-manager.deleteProfile:', error)
    throw error
  }
}

export function bulkDeleteProfiles(ids: string[]): number {
  try {
    const result = getDb().delete(profiles).where(inArray(profiles.id, ids)).run()
    return result.changes
  } catch (error) {
    console.error('profile-manager.bulkDeleteProfiles:', error)
    throw error
  }
}

export interface ProfileQueryParams {
  search?: string
  status?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface ProfileQueryResult {
  profiles: Profile[]
  total: number
}

export function queryProfiles(params: ProfileQueryParams): ProfileQueryResult {
  const db = getDb()
  const conditions: string[] = ['1=1']
  const values: unknown[] = []

  if (params.search) {
    conditions.push('name LIKE ?')
    values.push(`%${params.search}%`)
  }

  if (params.status && params.status !== 'All') {
    conditions.push('status = ?')
    values.push(params.status)
  }

  const where = conditions.join(' AND ')

  const total = (db.select().from(profiles).all() as Profile[]).filter((p) => {
    if (params.search && !p.name.toLowerCase().includes(params.search.toLowerCase())) return false
    if (params.status && params.status !== 'All' && p.status !== params.status) return false
    return true
  }).length

  let orderClause = 'ORDER BY created_at DESC'
  if (params.sortBy) {
    const valid = ['name', 'status', 'createdAt', 'updatedAt']
    if (valid.includes(params.sortBy)) {
      const dir = params.sortDir === 'desc' ? 'DESC' : 'ASC'
      orderClause = `ORDER BY ${params.sortBy === 'createdAt' ? 'created_at' : params.sortBy === 'updatedAt' ? 'updated_at' : params.sortBy} ${dir}`
    }
  }

  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 8
  const offset = (page - 1) * pageSize

  const sql = `SELECT * FROM profiles WHERE ${where} ${orderClause} LIMIT ? OFFSET ?`
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawDb = (db as any).$client
  const stmt = rawDb.prepare(sql)
  const result = stmt.all(...values, pageSize, offset) as Profile[]

  return { profiles: result, total }
}

