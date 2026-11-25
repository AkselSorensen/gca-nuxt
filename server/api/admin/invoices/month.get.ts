// GET /api/admin/invoices/month?month=YYYY-MM - archive ZIP : un dossier par vente avec les 3 factures
import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'
import { loadSale, buildInvoicePdf, INVOICE_KINDS, slug } from '../../../services/invoices'
import { buildZipBuffer } from '../../../utils/zip'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const month = String(getQuery(event).month || '')
  const m = month.match(/^(\d{4})-(\d{2})$/)
  if (!m) throw createError({ statusCode: 400, statusMessage: 'Mois invalide (format AAAA-MM)' })
  const y = Number(m[1])
  const mo = Number(m[2])
  const start = new Date(Date.UTC(y, mo - 1, 1))
  const end = new Date(Date.UTC(y, mo, 1))

  try {
    const sales = await query(
      `SELECT oi.id
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
        WHERE o.status = 'completed' AND o.created_at >= $1 AND o.created_at < $2
        ORDER BY o.created_at ASC, oi.id ASC
        LIMIT 500`,
      [start.toISOString(), end.toISOString()]
    )
    if (!sales.rowCount) throw createError({ statusCode: 404, statusMessage: 'Aucune vente sur ce mois' })

    const files: { name: string; data: Buffer }[] = []
    for (const row of sales.rows) {
      const sale = await loadSale(Number(row.id))
      if (!sale) continue
      const day = sale.createdAt.slice(0, 10)
      const folder = `${day}_cmd-${sale.orderId}_vente-${sale.orderItemId}_${slug(sale.title)}`
      for (const kind of INVOICE_KINDS) {
        files.push({ name: `${folder}/facture-${kind}.pdf`, data: await buildInvoicePdf(kind, sale) })
      }
    }

    setResponseHeader(event, 'Content-Type', 'application/zip')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="factures-${month}.zip"`)
    return buildZipBuffer(files)
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin monthly invoices error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la génération des factures du mois' })
  }
})
