// Notifications email liées aux commandes : facture acheteur, invitation avis,
// notification vendeur ("vous avez vendu"). Silencieux si le transport échoue.
import { query } from './db'
import { sendEmail } from './email'

const APP_URL = process.env.APP_BASE_URL || 'https://gsa-store.fr'

function currency(n: number): string {
  return Number(n).toFixed(2).replace('.', ',') + ' €'
}

export function orderInvoiceHtml(items: any[], total: number, discount: number): string {
  const rows = items
    .map(
      (it: any) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;color:#11171f">${it.title}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:center;color:#5a6478">${it.quantity}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f7;text-align:right;color:#11171f;font-weight:700">${currency(it.price * it.quantity)}</td>
        </tr>`
    )
    .join('')
  return `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="margin:0 0 4px;color:#11171f">Merci pour votre achat ! 🎉</h2>
      <p style="color:#5a6478;font-size:14px;margin:0 0 18px">Récapitulatif de votre commande GSA Store — facture d'achat.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr style="background:#f8fafc">
          <th style="padding:8px 12px;text-align:left;color:#5a6478;font-size:12px;text-transform:uppercase">Produit</th>
          <th style="padding:8px 12px;color:#5a6478;font-size:12px;text-transform:uppercase">Qté</th>
          <th style="padding:8px 12px;text-align:right;color:#5a6478;font-size:12px;text-transform:uppercase">Prix</th>
        </tr>
        ${rows}
      </table>
      <div style="padding:12px;text-align:right;font-size:14px">
        ${discount > 0 ? `<p style="margin:2px 0;color:#22c55e">Remise : −${currency(discount)}</p>` : ''}
        <p style="margin:2px 0;font-size:16px;font-weight:800;color:#11171f">Total : ${currency(total)}</p>
      </div>
      <p style="color:#5a6478;font-size:13px;line-height:1.6">Vos téléchargements sont disponibles sur votre profil : <a href="${APP_URL}/downloads" style="color:#2f7df6">Mes téléchargements</a></p>
      <p style="color:#98a2b3;font-size:12px;margin-top:20px">GSA Store — contact@gsa-store.fr</p>
    </div>
  `
}

export function reviewInviteHtml(items: any[]): string {
  const links = items
    .map(
      (it: any) =>
        `<a href="${APP_URL}/product/${it.slug}" style="display:inline-block;margin:6px 6px 0 0;padding:9px 16px;border-radius:8px;background:#f1f5f9;color:#2f7df6;text-decoration:none;font-size:13px;font-weight:600">${it.title} ⭐</a>`
    )
    .join('')
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="margin:0 0 12px;color:#11171f">Votre avis compte !</h2>
      <p style="color:#5a6478;font-size:14px;line-height:1.6">Vous avez récemment acheté sur GSA Store. Un avis de votre part aide les créateurs et les futurs acheteurs :</p>
      <div style="text-align:center;margin:16px 0">${links}</div>
      <p style="color:#5a6478;font-size:13px">2 minutes suffisent. Merci ! 🙏</p>
      <p style="color:#98a2b3;font-size:12px;margin-top:20px">GSA Store — L'équipe</p>
    </div>
  `
}

export function soldNotificationHtml(productTitle: string, quantity: number, price: number, buyerEmail: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="margin:0 0 12px;color:#11171f">🎉 Une vente sur GSA Store !</h2>
      <p style="color:#5a6478;font-size:14px;line-height:1.6">
        Votre création <strong style="color:#11171f">${productTitle}</strong> vient d'être vendue${quantity > 1 ? ` (x${quantity})` : ''} pour
        <strong style="color:#22c55e">${currency(price)}</strong>.
      </p>
      <p style="color:#5a6478;font-size:13px;line-height:1.6">Acheteur : ${buyerEmail || '—'}<br/>Le montant net (après commission GSA) sera reversé via votre compte Stripe Connect.</p>
      <p style="color:#5a6478;font-size:13px">Suivez vos ventes dans votre <a href="${APP_URL}/seller/account" style="color:#2f7df6">espace vendeur</a>.</p>
      <p style="color:#98a2b3;font-size:12px;margin-top:20px">GSA Store — L'équipe</p>
    </div>
  `
}

// Envoie les notifications d'une commande (facture + avis au client, vente aux vendeurs).
// Ne lève jamais : les erreurs d'email ne doivent pas casser le webhook.
export async function notifyOrderEmails(orderId: number, buyerEmail: string): Promise<void> {
  try {
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

    const total = Number(order.total_amount || 0)
    const discount = Number(order.discount_amount || 0)

    // 1) Facture à l'acheteur
    await sendEmail(emailTo, `Votre commande GSA Store — ${currency(total)}`, orderInvoiceHtml(items, total, discount))

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
