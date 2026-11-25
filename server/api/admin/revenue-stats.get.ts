// GET /api/admin/revenue-stats?year=2026&month=8 - indicateurs financiers d'une période
// month = 0 (ou absent) : toute l'année. Seules les commandes "completed" comptent
// (remboursements, annulations et paiements échoués n'y figurent jamais).
import { defineEventHandler, getQuery, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const q = getQuery(event)
  const now = new Date()
  const year = Number(q.year) || now.getFullYear()
  const month = Math.min(12, Math.max(0, Number(q.month) || 0))
  if (year < 2000 || year > 2100) throw createError({ statusCode: 400, statusMessage: 'Année invalide' })

  const start = month ? new Date(Date.UTC(year, month - 1, 1)) : new Date(Date.UTC(year, 0, 1))
  const end = month ? new Date(Date.UTC(year, month, 1)) : new Date(Date.UTC(year + 1, 0, 1))

  try {
    const stats = await query(
      `
        SELECT
          COALESCE(SUM(oi.price * oi.quantity), 0) AS gross,
          COALESCE(SUM(oi.seller_net_amount), 0) AS seller_net,
          COALESCE(SUM(oi.platform_fee_amount), 0) AS platform_fee,
          COUNT(oi.id)::int AS count
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'completed' AND o.created_at >= $1 AND o.created_at < $2
      `,
      [start.toISOString(), end.toISOString()]
    )
    const years = await query(
      `SELECT DISTINCT EXTRACT(YEAR FROM created_at)::int AS y FROM orders WHERE status = 'completed' ORDER BY y DESC`
    )
    const row = stats.rows[0]
    const available = years.rows.map((r: any) => Number(r.y))
    if (!available.includes(now.getFullYear())) available.unshift(now.getFullYear())
    return {
      year,
      month,
      gross: Number(row.gross),
      sellerNet: Number(row.seller_net),
      platformFee: Number(row.platform_fee),
      count: Number(row.count),
      years: available,
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin revenue-stats error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de charger les indicateurs' })
  }
})
