// POST /api/admin/users/:id/ban - bannit un utilisateur (accès coupé, sessions supprimées)
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { ensureBanColumns, purgeUserSessions } from '../../../../services/bans'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  if (Number(admin.id) === userId) throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas vous bannir vous-même' })

  try {
    await ensureBanColumns()
    const body = await readBody(event).catch(() => ({}))
    const reason = String(body?.reason || '').trim().slice(0, 300) || null
    const target = await query('SELECT id, role FROM users WHERE id = $1', [userId])
    if (!target.rowCount) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
    if (target.rows[0].role === 'admin') throw createError({ statusCode: 400, statusMessage: 'Impossible de bannir un administrateur' })

    await query('UPDATE users SET is_banned = TRUE, banned_at = NOW(), ban_reason = $2 WHERE id = $1', [userId, reason])
    await purgeUserSessions(userId)
    return { ok: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin ban error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Bannissement impossible' })
  }
})
