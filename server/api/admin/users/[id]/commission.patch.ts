// PATCH /api/admin/users/:id/commission — commission vendeur (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const userId = Number(getRouterParam(event, 'id'))
    const body = await readBody(event)
    const raw = Number(body?.commissionPercent)
    if (!userId || !Number.isFinite(raw)) {
      throw createError({ statusCode: 400, statusMessage: 'commissionPercent invalide' })
    }
    const commissionPercent = Math.min(100, Math.max(0, raw))
    const userRow = await query('SELECT role FROM users WHERE id = $1', [userId])
    if (!userRow.rowCount) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
    const role = userRow.rows[0].role
    if (role !== 'seller' && role !== 'admin') {
      throw createError({ statusCode: 400, statusMessage: "Ce compte n'est pas un vendeur" })
    }
    await query('UPDATE users SET commission_percent = $1 WHERE id = $2', [commissionPercent, userId])
    console.log(`[admin] commission vendeur ${userId} (${role}) → ${commissionPercent}%`)
    return { ok: true, id: userId, commissionPercent }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin commission error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update commission' })
  }
})
