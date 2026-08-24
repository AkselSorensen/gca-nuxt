// POST /api/admin/seller-requests/:id/approve — approuver un vendeur (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const userId = Number(getRouterParam(event, 'id'))
    if (!userId) throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })

    const result = await query(
      `UPDATE users SET seller_status = 'approved', role = 'seller'
       WHERE id = $1 AND seller_status = 'pending'
       RETURNING id, email, display_name, slug, role, seller_status`,
      [userId]
    )

    if (!result.rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Demande introuvable ou déjà traitée' })
    }

    return { ok: true, user: result.rows[0] }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Approve seller error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to approve seller' })
  }
})
