// POST /api/admin/invoices/zip - archive ZIP des factures d'une sélection de ventes
// Corps : { month: 'AAAA-MM' } ou { ids: [ids de lignes de vente] }
import { defineEventHandler, readBody, createError, setResponseHeader } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { saleIdsForMonth, buildSalesZip } from '../../../services/invoices'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event).catch(() => ({}))
  try {
    let ids: number[] = []
    let label = 'selection'
    if (body?.month) {
      const found = await saleIdsForMonth(String(body.month))
      if (found === null) throw createError({ statusCode: 400, statusMessage: 'Mois invalide (format AAAA-MM)' })
      ids = found
      label = String(body.month)
    } else if (Array.isArray(body?.ids)) {
      ids = [...new Set(body.ids.map((n: any) => Number(n)).filter((n: number) => Number.isInteger(n) && n > 0))].slice(0, 500) as number[]
    }
    const zip = ids.length ? await buildSalesZip(ids) : null
    if (!zip) throw createError({ statusCode: 404, statusMessage: 'Aucune facture à télécharger' })
    setResponseHeader(event, 'Content-Type', 'application/zip')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="factures-${label}.zip"`)
    return zip
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin invoices zip error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la génération des factures' })
  }
})
