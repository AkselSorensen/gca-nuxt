// GET /api/admin/users/:id/purchases - historique des achats d'un utilisateur (date, article, prix payé)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })
  try {
    const r = await query(
      `SELECT oi.id, o.id AS order_id, o.created_at, p.title, oi.quantity, oi.price,
              (oi.price * oi.quantity) AS paid
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         LEFT JOIN products p ON p.id = oi.product_id
        WHERE o.user_id = $1 AND o.status = 'completed'
        ORDER BY o.created_at DESC, oi.id DESC
        LIMIT 200`,
      [userId]
    )
    return {
      purchases: r.rows.map((row: any) => ({
        id: row.id,
        orderId: row.order_id,
        date: row.created_at,
        title: row.title || '(article supprimé)',
        quantity: Number(row.quantity || 1),
        paid: Number(row.paid || 0),
      })),
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin user purchases error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de charger les achats' })
  }
})
