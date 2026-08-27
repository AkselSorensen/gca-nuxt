// Notifications email liées aux commandes : facture acheteur, invitation avis,
// notification vendeur ("vous avez vendu"). Silencieux si le transport échoue.
import { query } from './db'
import { sendEmail } from './email'
import { premiumShell, productRowHtml, buttonRowHtml, currency } from './email-templates'

const APP_URL = process.env.APP_BASE_URL || 'https://gsa-store.fr'

// ─── Templates ────────────────────────────────────────────────

export function orderInvoiceHtml(items: any[], total: number, discount: number, orderId?: number): string {
  const rows = items.map((it: any) => productRowHtml({ title: it.title, slug: it.slug, price: Number(it.price), quantity: Number(it.quantity || 1) })).join('')
  const orderRef = orderId ? `<div style="display:inline-block;padding:5px 12px;border-radius:999px;background:#f1f5f9;font-size:11px;font-weight:700;color:#2f7df6;margin-bottom:14px;">Commande n°${orderId}</div>` : ''
  const summary = `
    ${orderRef}
    ${rows}
    <div class="soft-bg" style="background:#f8fafc;border-radius:12px;padding:14px 18px;text-align:right;margin-top:4px;">
      ${discount > 0 ? `<div class="text-sub" style="font-size:12.5px;color:#22c55e;font-weight:700;margin:2px 0;">Remise : −${currency(discount)}</div>` : ''}
      <div class="text-main" style="font-size:17px;font-weight:800;color:#111827;">Total : ${currency(total)}</div>
    </div>
    <p class="text-sub" style="font-size:13px;color:#5a6478;line-height:1.6;margin:14px 0 0;">Vos téléchargements sont disponibles sur votre profil :</p>
    ${buttonRowHtml('Mes téléchargements', `${APP_URL}/downloads`)}
  `
  return premiumShell(summary, {
    heroTitle: 'Merci pour votre achat ! 🎉',
    heroSub: `Récapitulatif de votre commande — <strong>${currency(total)}</strong>`,
    preheader: `Votre facture GSA Store — ${currency(total)}`,
  })
}

export function reviewInviteHtml(items: any[]): string {
  const chips = items
    .map(
      (it: any) =>
        `<a href="${APP_URL}/product/${it.slug}" style="display:inline-block;margin:6px 6px 0 0;padding:10px 18px;border-radius:10px;background:#f1f5f9;color:#2f7df6;text-decoration:none;font-size:13px;font-weight:700;">${it.title} ⭐</a>`
    )
    .join('')
  const content = `
    <p class="text-sub" style="font-size:14px;color:#5a6478;line-height:1.7;margin:0 0 6px;">Vous avez récemment acheté sur GSA Store. Un avis de votre part aide les créateurs et les futurs acheteurs :</p>
    <div style="text-align:center;margin:18px 0;">${chips}</div>
    <p class="text-sub" style="font-size:12.5px;color:#98a2b3;text-align:center;margin:8px 0 0;">2 minutes suffisent. Merci ! 🙏</p>
  `
  return premiumShell(content, {
    heroTitle: 'Votre avis compte ! ⭐',
    heroSub: 'Aidez la communauté GSA à choisir les meilleurs assets.',
    preheader: 'Laissez un avis sur vos achats GSA Store',
  })
}

export function soldNotificationHtml(productTitle: string, quantity: number, price: number, buyerEmail: string): string {
  const content = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="soft-bg" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:16px;">
      <tr>
        <td style="padding:16px 18px;text-align:center;">
          <div style="font-size:14px;color:#15803d;font-weight:800;">Votre création a trouvé preneur 🎉</div>
          <div class="text-main" style="font-size:22px;font-weight:900;color:#111827;margin-top:6px;">${currency(price)}</div>
          <div class="text-sub" style="font-size:12.5px;color:#6b7280;margin-top:2px;">${productTitle}${quantity > 1 ? ` · x${quantity}` : ''}</div>
        </td>
      </tr>
    </table>
    <p class="text-sub" style="font-size:13.5px;color:#5a6478;line-height:1.7;margin:0 0 14px;">Acheteur : <strong>${buyerEmail || '—'}</strong><br/>Le montant net (après commission GSA) sera reversé via votre compte Stripe Connect.</p>
    ${buttonRowHtml('Suivre mes ventes', `${APP_URL}/seller/account`)}
  `
  return premiumShell(content, {
    heroTitle: '🎉 Une vente sur GSA Store !',
    heroSub: productTitle,
    preheader: `Vente : ${productTitle} — ${currency(price)}`,
  })
}

// ─── Envoi ────────────────────────────────────────────────────

// Envoie les notifications d'une commande (facture + avis au client, vente aux vendeurs).
// Ne lève jamais : les erreurs d'email ne doivent pas casser le webhook.
export async function notifyOrderEmails(orderId: number, buyerEmail: string): Promise<void> {
  try {
    // Verrou d'idempotence : la 1re requête qui "réclame" la commande envoie les emails.
    // Le webhook Stripe ET /api/checkout/confirm-session appellent cette fonction —
    // un seul des deux doit réellement envoyer (colonne orders.notified_at).
    try {
      const claim = await query(
        `UPDATE orders SET notified_at = NOW() WHERE id = $1 AND notified_at IS NULL RETURNING id`,
        [orderId]
      )
      if (!claim.rowCount) {
        console.log('[email] commande', orderId, '— emails déjà envoyés, on saute')
        return
      }
    } catch (e: any) {
      // Colonne absente (base pas encore migrée) → on continue quand même : mieux vaut
      // un éventuel doublon qu'aucune facture.
      console.warn('[email] verrou notified_at indisponible:', e?.message || e)
    }

    const orderResult = await query(
      `SELECT o.total_amount, o.discount_amount,
              u.email AS buyer_email, u.display_name AS buyer_name
       FROM orders o JOIN users u ON u.id = o.user_id
       WHERE o.id = $1`,
      [orderId]
    )
    if (!orderResult.rowCount) return
    const order = orderResult.rows[0]
    const emailTo = buyerEmail || order.buyer_email
    if (!emailTo) return

    const itemsResult = await query(
      `SELECT oi.product_id, oi.price, oi.quantity, oi.seller_id,
              p.title, p.slug,
              s.email AS seller_email, s.display_name AS seller_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       JOIN users s ON s.id = oi.seller_id
       WHERE oi.order_id = $1`,
      [orderId]
    )
    const items = itemsResult.rows
    if (!items.length) return
    console.log('[email] commande', orderId, '→ facture à', emailTo, '|', items.length, 'article(s)')

    const total = Number(order.total_amount || 0)
    const discount = Number(order.discount_amount || 0)

    // 1) Facture à l'acheteur
    await sendEmail(emailTo, `Votre commande GSA Store n°${orderId} — ${currency(total)}`, orderInvoiceHtml(items, total, discount, orderId))

    // 2) Invitation à laisser un avis
    await sendEmail(emailTo, 'Votre avis compte sur GSA Store ⭐', reviewInviteHtml(items))

    // 3) Notification de vente à chaque vendeur
    const seen = new Set<number>()
    for (const it of items) {
      if (seen.has(it.seller_id)) continue
      seen.add(it.seller_id)
      const sellerTotal = items.filter((x: any) => x.seller_id === it.seller_id).reduce((s: number, x: any) => s + Number(x.price) * Number(x.quantity), 0)
      const qty = items.filter((x: any) => x.seller_id === it.seller_id).reduce((s: number, x: any) => s + Number(x.quantity), 0)
      if (it.seller_email) {
        await sendEmail(
          it.seller_email,
          `🎉 Vente sur GSA Store — ${it.title}`,
          soldNotificationHtml(it.title, qty, sellerTotal, emailTo)
        )
      }
    }
  } catch (e) {
    console.error('[email] notifyOrderEmails error:', e)
  }
}
