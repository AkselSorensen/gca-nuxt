// Service : Stripe (client + helpers de paiement/transferts — réplique du monolithe)
import Stripe from 'stripe'
import { pool, query } from './db'

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
export const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || ''
export const stripe: Stripe | null = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null
export const PLATFORM_COMMISSION_PERCENT = Math.min(100, Math.max(0, Number(process.env.PLATFORM_COMMISSION_PERCENT || 15)))

export function stripeSafeImage(url: string | null | undefined): string | null {
  return url && typeof url === 'string' && /^https?:\/\//i.test(url) ? url : null
}

// Payouts vendeurs : transferts Stripe Connect après la commande (mode manuel)
export async function createSellerTransfers(orderId: number, transferGroup?: string) {
  if (!stripe) return
  try {
    const result = await query(
      `SELECT oi.id, oi.transfer_id, oi.seller_net_amount, u.stripe_account_id
       FROM order_items oi
       JOIN users u ON u.id = oi.seller_id
       WHERE oi.order_id = $1`,
      [orderId]
    )

    for (const item of result.rows as any[]) {
      if (item.transfer_id) continue
      if (!item.stripe_account_id) {
        console.log(`[payout] order_item ${item.id}: vendeur sans compte Stripe Connect, pas de transfer`)
        continue
      }
      const amount = Math.round(Number(item.seller_net_amount || 0) * 100)
      if (amount <= 0) continue
      try {
        const transfer = await stripe.transfers.create({
          amount,
          currency: 'eur',
          destination: item.stripe_account_id,
          transfer_group: transferGroup || `order-${orderId}`,
        })
        await query(
          `UPDATE order_items SET transfer_id = $1, transfer_status = 'succeeded', transferred_at = NOW() WHERE id = $2`,
          [transfer.id, item.id]
        )
        console.log(`[payout] transfer ${transfer.id} : ${amount / 100} € → ${item.stripe_account_id} (order_item ${item.id})`)
      } catch (err: any) {
        await query(
          `UPDATE order_items SET transfer_status = 'failed', transfer_error = $1 WHERE id = $2`,
          [String(err.message || err).slice(0, 500), item.id]
        )
        console.error(`[payout] transfer failed order_item ${item.id}:`, err.message || err)
      }
    }
  } catch (error: any) {
    console.error('[payout] createSellerTransfers error:', error.message || error)
  }
}

// Destination charges ("Stripe gère les tarifs") → transfert automatique côté Stripe
export async function maybeCreateSellerTransfers(orderId: number, session: any) {
  if (String(session?.metadata?.transferMode || '') === 'destination') return
  await createSellerTransfers(orderId, session?.id || String(session))
}

// Enregistre les frais de traitement Stripe réels d'une commande (balance_transaction)
export async function recordStripeFee(orderId: number, session: any) {
  if (!stripe) return
  try {
    const piId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id
    if (!piId) return
    const pi = await stripe.paymentIntents.retrieve(piId, { expand: ['latest_charge.balance_transaction'] })
    let fee = Number((pi.latest_charge as any)?.balance_transaction?.fee || 0) / 100
    if (!fee && pi.latest_charge) {
      try {
        const chargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : (pi.latest_charge as any).id
        const charge = await stripe.charges.retrieve(chargeId, { expand: ['balance_transaction'] })
        fee = Number((charge as any).balance_transaction?.fee || 0) / 100
      } catch { /* non bloquant */ }
    }
    if (fee > 0) {
      await query('UPDATE orders SET stripe_fee_amount = $1 WHERE id = $2', [fee, orderId])
      console.log(`[fees] order ${orderId} : frais Stripe = ${fee} €`)
    }
  } catch (error: any) {
    console.error('[fees] recordStripeFee error:', error.message || error)
  }
}

// Mode de transfert : destination charge si le panier n'appartient qu'à UN vendeur
// avec un compte Connect actif ; sinon transferts manuels.
export async function resolveTransferMode(items: any[]) {
  try {
    const sellerIds = [...new Set((items || []).map((it) => it.product?.sellerId).filter(Boolean))]
    if (sellerIds.length === 1 && stripe) {
      const r = await query('SELECT stripe_account_id FROM users WHERE id = $1', [sellerIds[0]])
      const dest = r.rows[0]?.stripe_account_id
      if (dest) {
        try {
          const acct = await stripe.accounts.retrieve(dest)
          if (acct.charges_enabled) return { mode: 'destination', destination: dest }
        } catch { /* compte invalide → fallback manual */ }
      }
    }
  } catch (error: any) {
    console.error('[transfer] resolveTransferMode error:', error.message || error)
  }
  return { mode: 'manual', destination: null }
}
