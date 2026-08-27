// POST /api/checkout/confirm-session — confirme une session payée et crée la commande
// (réplique fidèle du monolithe Express : transactions, promo, transferts, frais)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { pool, query } from '../../services/db'
import { stripe, PLATFORM_COMMISSION_PERCENT, maybeCreateSellerTransfers, recordStripeFee } from '../../services/stripe'
import { notifyOrderEmails } from '../../services/notifications'

export default defineEventHandler(async (event) => {
  if (!stripe) {
    throw createError({ statusCode: 503, statusMessage: "Stripe n'est pas configuré." })
  }

  const body = await readBody(event)
  const sessionId = String(body?.sessionId || '').trim()
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Session Stripe manquante.' })
  }

  const user = await requireUser(event)
  const client = await pool.connect()
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (String(session.metadata?.userId || '') !== String(user.id)) {
      throw createError({ statusCode: 403, statusMessage: 'Cette session Stripe ne correspond pas à votre compte.' })
    }

    if (session.payment_status !== 'paid') {
      throw createError({ statusCode: 400, statusMessage: 'Paiement Stripe non validé.' })
    }

    const existingOrder = await query('SELECT id FROM orders WHERE stripe_session_id = $1 LIMIT 1', [session.id])
    if (existingOrder.rowCount) {
      return { ok: true, orderId: existingOrder.rows[0].id, alreadyConfirmed: true }
    }

    const cartId = Number(session.metadata?.cartId || 0)
    if (!cartId && session.metadata?.productSlug) {
      // Buy-now : commande directe depuis le productSlug
      const p = await client.query(
        'SELECT p.*, u.commission_percent AS seller_commission FROM products p JOIN users u ON u.id = p.seller_id WHERE p.slug = $1',
        [session.metadata.productSlug]
      )
      if (!p.rowCount) {
        await client.query('ROLLBACK')
        throw createError({ statusCode: 404, statusMessage: 'Produit introuvable.' })
      }
      const product = p.rows[0]
      const price = Number(product.price)
      const cp = Number(product.seller_commission) || PLATFORM_COMMISSION_PERCENT
      const fee = Math.round(price * cp) / 100
      const ord = await client.query(
        `INSERT INTO orders (user_id, stripe_session_id, total_amount, subtotal_amount, status) VALUES ($1,$2,$3,$4,'completed') RETURNING id`,
        [user.id, session.id, price, price]
      )
      await client.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, price, quantity, customer_email, platform_fee_percent, platform_fee_amount, seller_net_amount) VALUES ($1,$2,$3,$4,1,$5,$6,$7,$8)`,
        [ord.rows[0].id, product.id, product.seller_id, price, user.email, cp, fee, price - fee]
      )
      await client.query('COMMIT')
      await maybeCreateSellerTransfers(ord.rows[0].id, session)
      await recordStripeFee(ord.rows[0].id, session)
      // Emails : facture + invitation avis (acheteur) + notification de vente (vendeur).
      // Idempotent (orders.notified_at) — le webhook Stripe appelle la même fonction.
      await notifyOrderEmails(ord.rows[0].id, user.email || session.customer_details?.email || '')
      return { ok: true, orderId: ord.rows[0].id }
    }
    if (!cartId) {
      throw createError({ statusCode: 400, statusMessage: 'Panier Stripe introuvable.' })
    }

    // Checkout panier : transaction complète
    await client.query('BEGIN')

    const subtotalAmount = Number(session.metadata?.subtotalAmount || 0) || Number(session.amount_subtotal || 0) / 100
    const discountAmount = Number(session.metadata?.discountAmount || 0) || Number(session.total_details?.amount_discount || 0) / 100
    const promoCodeId = Number(session.metadata?.promoCodeId || 0) || null

    const orderInsert = await client.query(
      `
        INSERT INTO orders (user_id, stripe_session_id, total_amount, subtotal_amount, discount_amount, promo_code_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'completed')
        RETURNING id
      `,
      [user.id, session.id, Number(session.amount_total || 0) / 100, subtotalAmount, discountAmount, promoCodeId]
    )
    const orderId = orderInsert.rows[0].id

    const itemsInsert = await client.query(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          seller_id,
          price,
          quantity,
          customer_email,
          platform_fee_percent,
          platform_fee_amount,
          seller_net_amount
        )
        SELECT
          $1,
          p.id,
          p.seller_id,
          p.price,
          ci.quantity,
          $2,
          u.commission_percent,
          ROUND((p.price * ci.quantity * u.commission_percent / 100)::numeric, 2),
          ROUND((p.price * ci.quantity * (1 - u.commission_percent::numeric / 100))::numeric, 2)
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        JOIN users u ON u.id = p.seller_id
        WHERE ci.cart_id = $3
        RETURNING id
      `,
      [orderId, user.email || session.customer_email || null, cartId]
    )

    if (!itemsInsert.rowCount) {
      throw new Error('Aucun article à enregistrer pour cette commande.')
    }

    if (promoCodeId) {
      const promoUpdate = await client.query(
        `
          UPDATE promo_codes
          SET
            redeemed_count = redeemed_count + 1,
            points_balance = points_balance + GREATEST(points_per_redemption, 0)
          WHERE id = $1
          RETURNING points_per_redemption
        `,
        [promoCodeId]
      )
      const pointsAwarded = Math.max(0, Number(promoUpdate.rows[0]?.points_per_redemption || 0))
      await client.query(
        `
          INSERT INTO promo_redemptions (promo_code_id, user_id, order_id, discount_amount, order_amount, points_awarded)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [promoCodeId, user.id, orderId, discountAmount, Number(session.amount_total || 0) / 100, pointsAwarded]
      )
    }

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId])
    await client.query('COMMIT')

    await maybeCreateSellerTransfers(orderId, session)
    await recordStripeFee(orderId, session)
    // Emails : facture + invitation avis (acheteur) + notification de vente (vendeur).
    // Idempotent (orders.notified_at) — le webhook Stripe appelle la même fonction.
    await notifyOrderEmails(orderId, user.email || session.customer_details?.email || '')

    return { ok: true, orderId, alreadyConfirmed: false }
  } catch (error: any) {
    try {
      await client.query('ROLLBACK')
    } catch { /* ignore */ }
    if (error?.statusCode) throw error
    console.error('Stripe confirm session error:', error.message || error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de confirmer la commande Stripe.' })
  } finally {
    client.release()
  }
})
