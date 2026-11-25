// GET /api/admin/invoices/:itemId/:kind - une facture PDF d'une vente (client | vendeur | plateforme)
import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { loadSale, buildInvoicePdf, buildSalesZip, invoiceNumber, INVOICE_KINDS, type InvoiceKind } from '../../../../services/invoices'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const itemId = Number(getRouterParam(event, 'itemId'))
  const kind = String(getRouterParam(event, 'kind') || '') as InvoiceKind | 'all'
  if (!itemId || (kind !== 'all' && !INVOICE_KINDS.includes(kind))) {
    throw createError({ statusCode: 400, statusMessage: 'Facture invalide' })
  }
  try {
    const sale = await loadSale(itemId)
    if (!sale) throw createError({ statusCode: 404, statusMessage: 'Vente introuvable' })
    if (kind === 'all') {
      // Les 3 factures de la vente (dossiers client / vendeur / admin)
      const zip = await buildSalesZip([itemId])
      if (!zip) throw createError({ statusCode: 404, statusMessage: 'Aucune facture' })
      setResponseHeader(event, 'Content-Type', 'application/zip')
      setResponseHeader(event, 'Content-Disposition', `attachment; filename="factures-vente-${sale.orderId}-${sale.orderItemId}.zip"`)
      return zip
    }
    const pdf = await buildInvoicePdf(kind, sale)
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="facture-${kind}-${invoiceNumber(kind, sale)}.pdf"`)
    return pdf
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin invoice error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la génération de la facture' })
  }
})
