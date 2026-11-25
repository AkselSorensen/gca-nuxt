// POST /api/admin/users/:id/unban - rétablit l'accès d'un utilisateur banni
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { ensureBanColumns } from '../../../../services/bans'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  try {
    await ensureBanColumns()
    const r = await query('UPDATE users SET is_banned = FALSE, banned_at = NULL, ban_reason = NULL WHERE id = $1 RETURNING id', [userId])
    if (!r.rowCount) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
    return { ok: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin unban error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Rétablissement impossible' })
  }
})
