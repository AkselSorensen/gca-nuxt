// Factures admin : 3 documents par vente (client, vendeur, plateforme).
// Chaque vente est ARCHIVÉE au moment de la commande (table invoice_snapshots) : les factures
// restent téléchargeables même si l'article ou le compte du vendeur est supprimé ensuite.
import { query } from './db'
import _PDFDocument from 'pdfkit'
import { buildZipBuffer } from '../utils/zip'
import logoB64Mod from '../express/logo-b64.cjs'

const PDFDocument = (_PDFDocument as any).default || _PDFDocument
const logoB64 = (logoB64Mod as any).default || logoB64Mod

export type InvoiceKind = 'client' | 'vendeur' | 'plateforme'
export const INVOICE_KINDS: InvoiceKind[] = ['client', 'vendeur', 'plateforme']

let tablesReady = false
async function ensureTables() {
  if (tablesReady) return
  await query(`
    CREATE TABLE IF NOT EXISTS invoice_snapshots (
      order_item_id INTEGER PRIMARY KEY,
      order_id INTEGER NOT NULL,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)
  tablesReady = true
}

export interface SaleSnapshot {
  orderId: number
  orderItemId: number
  createdAt: string
  stripeSessionId: string
  title: string
  quantity: number
  unitPrice: number
  gross: number
  feePercent: number
  platformFee: number
  sellerNet: number
  seller: { id: number | null; name: string; email: string }
  buyer: { id: number | null; name: string; email: string }
  orderTotal: number
  orderSubtotal: number
  discount: number
  items: { title: string; quantity: number; price: number }[]
  archivedAt?: string
}

async function buildLive(orderItemId: number): Promise<SaleSnapshot | null> {
  const r = await query(
    `
      SELECT
        oi.id AS item_id, oi.order_id, oi.quantity, oi.price,
        oi.platform_fee_percent, oi.platform_fee_amount, oi.seller_net_amount,
        o.created_at, o.stripe_session_id, o.total_amount, o.subtotal_amount, o.discount_amount,
        p.title,
        s.id AS seller_id, s.display_name AS seller_name, s.email AS seller_email,
        bu.id AS buyer_id, bu.display_name AS buyer_name, bu.email AS buyer_email,
        COALESCE((
          SELECT json_agg(json_build_object(
            'title', COALESCE(p2.title, '(article supprimé)'),
            'quantity', oi2.quantity,
            'price', oi2.price
          ) ORDER BY oi2.id)
          FROM order_items oi2
          LEFT JOIN products p2 ON p2.id = oi2.product_id
          WHERE oi2.order_id = oi.order_id
        ), '[]'::json) AS items
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      LEFT JOIN products p ON p.id = oi.product_id
      LEFT JOIN users s ON s.id = oi.seller_id
      LEFT JOIN users bu ON bu.id = o.user_id
      WHERE oi.id = $1
      LIMIT 1
    `,
    [orderItemId]
  )
  if (!r.rowCount) return null
  const row = r.rows[0]
  const qty = Number(row.quantity || 1)
  const unit = Number(row.price || 0)
  return {
    orderId: Number(row.order_id),
    orderItemId: Number(row.item_id),
    createdAt: new Date(row.created_at).toISOString(),
    stripeSessionId: String(row.stripe_session_id || ''),
    title: row.title || '(article supprimé)',
    quantity: qty,
    unitPrice: unit,
    gross: unit * qty,
    feePercent: Number(row.platform_fee_percent || 0),
    platformFee: Number(row.platform_fee_amount || 0),
    sellerNet: Number(row.seller_net_amount || 0),
    seller: { id: row.seller_id ? Number(row.seller_id) : null, name: row.seller_name || 'Vendeur', email: row.seller_email || '' },
    buyer: { id: row.buyer_id ? Number(row.buyer_id) : null, name: row.buyer_name || 'Client', email: row.buyer_email || '' },
    orderTotal: Number(row.total_amount || 0),
    orderSubtotal: Number(row.subtotal_amount || 0),
    discount: Number(row.discount_amount || 0),
    items: (row.items || []).map((i: any) => ({ title: i.title, quantity: Number(i.quantity || 1), price: Number(i.price || 0) })),
  }
}

/** Retourne l'archive de la vente ; la crée à partir des données actuelles si elle n'existe pas encore. */
export async function loadSale(orderItemId: number): Promise<SaleSnapshot | null> {
  await ensureTables()
  const existing = await query('SELECT data, created_at FROM invoice_snapshots WHERE order_item_id = $1', [orderItemId])
  if (existing.rowCount) {
    const data = existing.rows[0].data as SaleSnapshot
    data.archivedAt = new Date(existing.rows[0].created_at).toISOString()
    return data
  }
  const live = await buildLive(orderItemId)
  if (!live) return null
  await query(
    'INSERT INTO invoice_snapshots (order_item_id, order_id, data) VALUES ($1, $2, $3) ON CONFLICT (order_item_id) DO NOTHING',
    [live.orderItemId, live.orderId, JSON.stringify(live)]
  )
  live.archivedAt = new Date().toISOString()
  return live
}

/** Archive toutes les lignes d'une commande (appelé à la création de la commande). Ne bloque jamais. */
export async function snapshotOrder(orderId: number): Promise<void> {
  try {
    const items = await query('SELECT id FROM order_items WHERE order_id = $1', [orderId])
    for (const row of items.rows) await loadSale(Number(row.id))
  } catch (e: any) {
    console.error('[invoices] archivage impossible pour la commande', orderId, e?.message || e)
  }
}

// ─── PDF ───────────────────────────────────────────────────────

function euro(value: any) {
  const n = Number(value || 0)
  const parts = n.toFixed(2).split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return parts.join(',') + ' €'
}

function dateFr(value: any) {
  return new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function invoiceNumber(kind: InvoiceKind, sale: SaleSnapshot) {
  if (kind === 'client') return `INV-${String(sale.orderId).padStart(5, '0')}`
  const prefix = kind === 'vendeur' ? 'FV' : 'FP'
  return `${prefix}-${String(sale.orderId).padStart(5, '0')}-${sale.orderItemId}`
}

const TITLES: Record<InvoiceKind, string> = {
  client: 'FACTURE CLIENT',
  vendeur: 'FACTURE VENDEUR',
  plateforme: 'FACTURE PLATEFORME',
}

export function buildInvoicePdf(kind: InvoiceKind, sale: SaleSnapshot): Promise<Buffer> {
  return new Promise((resolve, reject) => {
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

    // En-tête
    doc.rect(0, 0, doc.page.width, 84).fill(dark)
    const logoBuffer = Buffer.from(String(logoB64).split(',')[1] || '', 'base64')
    if (logoBuffer.length > 0) doc.image(logoBuffer, 48, 22, { fit: [80, 40] })
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text('GSA Store', 140, 36)
    doc.fillColor(primary).font('Helvetica-Bold').fontSize(18).text(TITLES[kind], 0, 28, { align: 'right', width: W })
    doc.fillColor(muted).font('Helvetica').fontSize(8.5)
      .text(`N° ${invoiceNumber(kind, sale)}  ·  Date : ${dateFr(sale.createdAt)}`, 0, 104, { align: 'right', width: W })

    // Parties
    const left = kind === 'client' ? { label: 'FACTURÉ À', who: sale.buyer } : { label: 'VENDEUR', who: sale.seller }
    doc.font('Helvetica-Bold').fontSize(8).fillColor(muted).text(left.label, 48, 132)
    doc.font('Helvetica').fontSize(10).fillColor(dark).text(left.who.name || '-', 48, 145)
    doc.fontSize(8.5).fillColor(muted).text(left.who.email || '', 48, 160)
    const rightLabel = kind === 'client' ? 'VENDU PAR' : 'CLIENT'
    const rightName = kind === 'client' ? (sale.items.length ? sale.seller.name : 'GSA Store') : sale.buyer.name
    doc.font('Helvetica-Bold').fontSize(8).fillColor(muted).text(rightLabel, 0, 132, { align: 'right', width: W })
    doc.font('Helvetica').fontSize(10).fillColor(dark).text(rightName || '-', 0, 145, { align: 'right', width: W })

    // Tableau
    const top = 196
    doc.rect(48, top, W, 22).fill('#f1f5f9')
    doc.fillColor(muted).font('Helvetica-Bold').fontSize(8)
    doc.text('DESCRIPTION', 48, top + 7)
    doc.text('QTÉ', 0, top + 7, { align: 'right', width: 340 })
    doc.text('PRIX UNITAIRE', 0, top + 7, { align: 'right', width: 440 })
    doc.text('MONTANT', 0, top + 7, { align: 'right', width: W })

    let y = top + 30
    doc.font('Helvetica').fontSize(9).fillColor(dark)
    const rows: { label: string; qty: number; unit: number; amount: number }[] = []
    if (kind === 'client') {
      for (const it of sale.items) rows.push({ label: it.title, qty: it.quantity, unit: it.price, amount: it.price * it.quantity })
    } else if (kind === 'vendeur') {
      rows.push({ label: `${sale.title} - prix brut`, qty: sale.quantity, unit: sale.unitPrice, amount: sale.gross })
      rows.push({ label: `Commission GSA Store (${sale.feePercent} %)`, qty: 1, unit: -sale.platformFee, amount: -sale.platformFee })
    } else {
      rows.push({ label: `Commission sur la vente : ${sale.title}`, qty: 1, unit: sale.platformFee, amount: sale.platformFee })
    }
    for (const r of rows) {
      const h = Math.max(20, doc.heightOfString(r.label, { width: 280 }) + 4)
      doc.fillColor(dark).text(r.label, 48, y, { width: 280 })
      doc.text(String(r.qty), 0, y, { align: 'right', width: 340 })
      doc.text(euro(r.unit), 0, y, { align: 'right', width: 440 })
      doc.text(euro(r.amount), 0, y, { align: 'right', width: W })
      doc.moveTo(48, y + h + 2).lineTo(48 + W, y + h + 2).strokeColor(light).lineWidth(0.5).stroke()
      y += h + 10
    }

    // Total
    y += 6
    let total = 0
    let totalLabel = 'TOTAL'
    if (kind === 'client') {
      totalLabel = 'TOTAL TTC'
      total = sale.orderTotal > 0 ? sale.orderTotal : Math.max(0, sale.orderSubtotal - sale.discount)
      if (sale.discount > 0) {
        doc.font('Helvetica').fontSize(9).fillColor(muted).text('Remise (code promo)', 0, y, { align: 'right', width: 440 })
        doc.fillColor('#dc2626').text(`-${euro(sale.discount)}`, 0, y, { align: 'right', width: W })
        y += 16
      }
    } else if (kind === 'vendeur') {
      totalLabel = 'PART REVENANT AU VENDEUR'
      total = sale.sellerNet
    } else {
      totalLabel = 'COMMISSION GSA STORE'
      total = sale.platformFee
    }
    doc.rect(48, y - 4, W, 26).fill(dark)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10.5).text(totalLabel, 0, y + 4, { align: 'right', width: W - 90 })
    doc.text(euro(total), 0, y + 4, { align: 'right', width: W })

    doc.font('Helvetica').fontSize(7.5).fillColor(muted)
      .text('TVA non applicable, art. 293 B du CGI', 0, y + 34, { align: 'right', width: W })
    doc.text(`Vente n° ${sale.orderId}-${sale.orderItemId}  ·  Transaction ${sale.stripeSessionId.slice(0, 18)}`, 48, y + 34)
    if (kind !== 'client') {
      doc.text(`Prix brut ${euro(sale.gross)}  ·  Commission ${sale.feePercent} % (${euro(sale.platformFee)})  ·  Part vendeur ${euro(sale.sellerNet)}`, 48, y + 48)
    }

    const footerY = doc.page.height - 64
    doc.moveTo(48, footerY - 8).lineTo(48 + W, footerY - 8).strokeColor(light).lineWidth(0.5).stroke()
    doc.fillColor(muted).fontSize(7.5).text('GSA Store · document archivé, conservé même si l\'article ou le vendeur est supprimé.', 48, footerY)
    doc.text(`Généré le ${dateFr(new Date())}`, 0, footerY, { align: 'right', width: W })

    doc.end()
  })
}

/** Ids des lignes de vente (commandes complétées) d'un mois AAAA-MM ; null si le format est invalide. */
export async function saleIdsForMonth(month: string): Promise<number[] | null> {
  const m = String(month || '').match(/^(\d{4})-(\d{2})$/)
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const r = await query(
    `SELECT oi.id FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.status = 'completed' AND o.created_at >= $1 AND o.created_at < $2
      ORDER BY o.created_at ASC, oi.id ASC LIMIT 500`,
    [new Date(Date.UTC(y, mo - 1, 1)).toISOString(), new Date(Date.UTC(y, mo, 1)).toISOString()]
  )
  return r.rows.map((row: any) => Number(row.id))
}

// Dossiers de l'archive : la facture « plateforme » s'appelle « admin » dans l'interface
export const KIND_FOLDER: Record<InvoiceKind, string> = { client: 'client', vendeur: 'vendeur', plateforme: 'admin' }

/**
 * ZIP de plusieurs ventes : trois dossiers (client, vendeur, admin) ; le nom de chaque fichier contient
 * le type, le numéro de facture et la date. Une facture client (par commande) n'est ajoutée qu'une fois.
 */
export async function buildSalesZip(itemIds: number[]): Promise<Buffer | null> {
  const files: { name: string; data: Buffer }[] = []
  const seen = new Set<string>()
  for (const id of itemIds) {
    const sale = await loadSale(id)
    if (!sale) continue
    const day = sale.createdAt.slice(0, 10)
    for (const kind of INVOICE_KINDS) {
      const folder = KIND_FOLDER[kind]
      const name = `${folder}/${folder}_${invoiceNumber(kind, sale)}_${day}.pdf`
      if (seen.has(name)) continue
      seen.add(name)
      files.push({ name, data: await buildInvoicePdf(kind, sale) })
    }
  }
  return files.length ? buildZipBuffer(files) : null
}

export function slug(value: string) {
  return String(value || 'article')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'article'
}
