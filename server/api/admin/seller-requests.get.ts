// GET /api/admin/seller-requests — demandes vendeurs en attente (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const result = await query(
      `SELECT id, email, display_name AS "displayName", slug, seller_description AS "sellerDescription",
              shop_name AS "shopName", discord_tag AS "discordTag", created_at AS "createdAt"
       FROM users
       WHERE seller_status = 'pending'
       ORDER BY created_at ASC`
    )
    return { items: result.rows }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Seller requests error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch seller requests' })
  }
})
