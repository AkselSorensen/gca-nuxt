// PATCH /api/profile — mise à jour du profil (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../utils/auth'
import { query } from '../services/db'
import { sanitizeUser } from '../services/users'
import { updateSessionUser } from '../services/session'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    const body = await readBody(event)
    const { displayName, email, avatarUrl } = body

    const updates: string[] = []
    const values: any[] = []
    let idx = 1
    if (displayName && String(displayName).trim()) { updates.push(`display_name = $${idx++}`); values.push(String(displayName).trim()) }
    if (email && String(email).trim()) { updates.push(`email = $${idx++}`); values.push(String(email).trim().toLowerCase()) }
    if (avatarUrl !== undefined) { updates.push(`avatar_url = $${idx++}`); values.push(avatarUrl ? String(avatarUrl).trim() : null) }
    if (!updates.length) throw createError({ statusCode: 400, statusMessage: 'No fields to update' })

    values.push(user.id)
    const result = await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values)
    const sanitized = sanitizeUser(result.rows[0])
    await updateSessionUser(event, sanitized)

    return { ok: true, user: sanitized }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Profile update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update profile' })
  }
})
