import { randomUUID } from 'crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '../db'
import { groups } from '../db/schema'
import type { Group, CreateGroupDTO } from '@shared/types'

export function createGroup(data: CreateGroupDTO): Group {
  const id = randomUUID()
  const now = new Date()

  getDb().insert(groups).values({
    id,
    name: data.name,
    color: data.color ?? '#4F7CFF',
    createdAt: now,
    updatedAt: now
  }).run()

  return getGroupById(id)!
}

export function getAllGroups(): Group[] {
  return getDb().select().from(groups).all() as Group[]
}

export function getGroupById(id: string): Group | undefined {
  const result = getDb().select().from(groups).where(eq(groups.id, id)).all()
  return result[0] as Group | undefined
}

export function updateGroup(id: string, data: Partial<CreateGroupDTO>): Group | undefined {
  const existing = getGroupById(id)
  if (!existing) return undefined

  const now = new Date()
  const updateData: Record<string, unknown> = { updatedAt: now }

  if (data.name !== undefined) updateData.name = data.name
  if (data.color !== undefined) updateData.color = data.color

  getDb().update(groups).set(updateData).where(eq(groups.id, id)).run()

  return getGroupById(id)
}

export function deleteGroup(id: string): boolean {
  const existing = getGroupById(id)
  if (!existing) return false

  getDb().delete(groups).where(eq(groups.id, id)).run()
  return true
}
