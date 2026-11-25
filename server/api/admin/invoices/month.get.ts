// GET /api/admin/invoices/month?month=YYYY-MM - archive ZIP des factures du mois (dossiers client / vendeur / admin)
import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { saleIdsForMonth, buildSalesZip } from '../../../services/invoices'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const month = String(getQuery(event).month || '')
  const ids = await saleIdsForMonth(month)
  if (ids === null) throw createError({ statusCode: 400, statusMessage: 'Mois invalide (format AAAA-MM)' })
  const zip = ids.length ? await buildSalesZip(ids) : null
  if (!zip) throw createError({ statusCode: 404, statusMessage: 'Aucune vente sur ce mois' })
  setResponseHeader(event, 'Content-Type', 'application/zip')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="factures-${month}.zip"`)
  return zip
})
