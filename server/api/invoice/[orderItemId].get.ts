// GET /api/invoice/:orderItemId — facture PDF (réplique du monolithe Express)
import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3'
import { requireUser } from '../../utils/auth'
import { query } from '../../services/db'
import _PDFDocument from 'pdfkit'
import logoB64Mod from '../../express/logo-b64.cjs'

const PDFDocument = (_PDFDocument as any).default || _PDFDocument
const logoB64 = (logoB64Mod as any).default || logoB64Mod

function invoiceNumber(orderId: number) {
  return `INV-${String(orderId).padStart(5, '0')}`
}

function formatInvoiceDate(value: any) {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatEuro(value: any) {
  const n = Number(value || 0)
  const parts = n.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join(',') + ' €'
}

function formatPercent(value: any) {
  return Number(value || 0).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' %'
}

function generatePdf(order: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const items = order.items || []
    const discount = Number(order.discount_amount || 0)
    const subtotal = Number(order.subtotal_amount || 0)
    const total = Number(order.total_amount || 0)
    const sellers = [...new Set(items.map((i: any) => i.seller_name).filter(Boolean))]

    const doc = new PDFDocument({ size: 'A4', margin: 48 })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const primary = '#2f7df6'
    const dark = '#11171f'
    const muted = '#5a6478'
    const light = '#e2e8f0'
    const W = doc.page.width - 96
    const usableBottom = doc.page.height - 60

    // Header sombre avec logo (sans encadrement)
    doc.rect(0, 0, doc.page.width, 84).fill(dark)
    const logoBuffer = Buffer.from(String(logoB64).split(',')[1] || '', 'base64')
    if (logoBuffer.length > 0) {
      doc.image(logoBuffer, 48, 22, { fit: [80, 40] })
    }
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff')
      .text('GSA Store', 140, 36)
    doc.fillColor(primary).font('Helvetica-Bold').fontSize(20).text('FACTURE', 0, 26, { align: 'right', width: W })

    doc.fillColor(muted).font('Helvetica').fontSize(8.5)
      .text(`N° ${invoiceNumber(order.order_id)}  ·  Date : ${formatInvoiceDate(order.created_at)}`, 0, 100, { align: 'right', width: W })

    doc.font('Helvetica-Bold').fontSize(8).fillColor(muted).text('FACTURÉ À', 48, 132)
    doc.font('Helvetica').fontSize(10).fillColor(dark).text(order.buyer_name || 'Client', 48, 145)
    doc.fontSize(8.5).fillColor(muted).text(order.buyer_email || '', 48, 160)
    doc.font('Helvetica-Bold').fontSize(8).fillColor(muted).text('VENDU PAR', 0, 132, { align: 'right', width: W })
    doc.font('Helvetica').fontSize(10).fillColor(dark).text(sellers.join(', ') || 'Vendeur GSA', 0, 145, { align: 'right', width: W })

    // Tableau des articles
    const tableTop = 190
    doc.rect(48, tableTop, W, 22).fill('#f1f5f9')
    doc.fillColor(muted).font('Helvetica-Bold').fontSize(8)
    doc.text('PRODUIT', 48, tableTop + 6)
    doc.text('QTÉ', 0, tableTop + 6, { align: 'right', width: 340 })
    doc.text('PRIX UNITAIRE', 0, tableTop + 6, { align: 'right', width: 440 })
    doc.text('TOTAL', 0, tableTop + 6, { align: 'right', width: W })

    let rowY = tableTop + 26
    doc.font('Helvetica').fontSize(9).fillColor(dark)
    items.forEach((item: any, i: number) => {
      if (rowY > usableBottom - 120) {
        doc.addPage()
        rowY = 48
      }
      const titleHeight = doc.heightOfString(item.title, { width: 280 })
      const rowHeight = Math.max(20, titleHeight + 4)
      doc.text(item.title, 48, rowY, { width: 280 })
      doc.fontSize(9).fillColor(dark)
      doc.text(String(item.quantity), 0, rowY, { align: 'right', width: 340 })
      doc.text(formatEuro(item.price), 0, rowY, { align: 'right', width: 440 })
      doc.text(formatEuro(Number(item.price) * Number(item.quantity)), 0, rowY, { align: 'right', width: W })
      if (i < items.length - 1) {
        doc.moveTo(48, rowY + rowHeight + 2).lineTo(48 + W, rowY + rowHeight + 2).strokeColor(light).lineWidth(0.5).stroke()
      }
      rowY += rowHeight + 8
    })

    // Totaux — section HT → TVA → TTC (labels alignés à droite jusqu'à x=440, montants jusqu'à x=48+W)
    if (rowY > usableBottom - 170) {
      doc.addPage()
      rowY = 48
    }
    rowY += 6
    doc.fontSize(9)
    doc.fillColor(muted).text('PRIX HT *', 0, rowY, { align: 'right', width: 440 })
    doc.fillColor(dark).text(formatEuro(subtotal), 0, rowY, { align: 'right', width: W })
    rowY += 15

    if (discount > 0) {
      doc.fillColor(muted).text('Remise (code promo)', 0, rowY, { align: 'right', width: 440 })
      doc.fillColor('#dc2626').text(`-${formatEuro(discount)}`, 0, rowY, { align: 'right', width: W })
      rowY += 15
    }

    // Total réellement payé par l'acheteur (montant encaissé par Stripe)
    const totalTTC = total > 0 ? total : Math.max(0, subtotal - discount)
    doc.rect(48, rowY - 4, W, 24).fill(dark)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10.5).text('TOTAL TTC', 0, rowY + 4, { align: 'right', width: W - 70 })
    doc.text(formatEuro(totalTTC), 0, rowY + 4, { align: 'right', width: W })

    // Astérisque : mention TVA sous le total TTC
    doc.font('Helvetica').fontSize(7.5).fillColor(muted)
      .text('* TVA non applicable, art. 293 B du CGI', 0, rowY + 26, { align: 'right', width: W })

    doc.fillColor(muted).font('Helvetica').fontSize(7.5)
    doc.text('Paiement sécurisé via Stripe.', 48, rowY + 40)
    doc.text(`Commande n° ${order.order_id} · Transaction Stripe ${String(order.stripe_session_id || '').slice(0, 18)}`, 48, rowY + 52)

    const footerY = usableBottom - 4
    doc.moveTo(48, footerY - 8).lineTo(48 + W, footerY - 8).strokeColor(light).lineWidth(0.5).stroke()
    doc.fillColor(muted).fontSize(7.5).text('GSA Store · un standard à venir.', 48, footerY)
    doc.text(`Facture générée le ${formatInvoiceDate(new Date())}`, 0, footerY, { align: 'right', width: W })

    doc.end()
  })
}

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    const orderItemId = Number(getRouterParam(event, 'orderItemId'))
    if (!orderItemId) throw createError({ statusCode: 400, statusMessage: 'orderItemId invalide' })

    const result = await query(
      `
        SELECT
          o.id AS order_id,
          o.created_at,
          o.total_amount,
          o.subtotal_amount,
          o.discount_amount,
          o.stripe_fee_amount,
          o.stripe_session_id,
          u.display_name AS buyer_name,
          u.email AS buyer_email,
          json_agg(
            json_build_object(
              'order_item_id', oi.id,
              'title', p.title,
              'quantity', oi.quantity,
              'price', oi.price,
              'seller_name', s.display_name,
              'platform_fee_percent', oi.platform_fee_percent,
              'platform_fee_amount', oi.platform_fee_amount,
              'seller_net_amount', oi.seller_net_amount
            ) ORDER BY oi.id
          ) AS items
        FROM orders o
        JOIN users u ON u.id = o.user_id
        JOIN order_items oi ON oi.order_id = o.id
        JOIN products p ON p.id = oi.product_id
        JOIN users s ON s.id = oi.seller_id
        WHERE o.id = (
          SELECT o2.id
          FROM order_items oi2
          JOIN orders o2 ON o2.id = oi2.order_id
          WHERE oi2.id = $1
        )
        AND o.user_id = $2
        GROUP BY o.id, u.display_name, u.email
        LIMIT 1
      `,
      [orderItemId, user.id]
    )

    if (!result.rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Commande introuvable' })
    }

    const pdf = await generatePdf(result.rows[0])
    setResponseHeader(event, 'Content-Type', 'application/pdf')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="facture-${invoiceNumber(result.rows[0].order_id)}.pdf"`)
    return pdf
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Invoice error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la génération de la facture' })
  }
})
