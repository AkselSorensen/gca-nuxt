// POST /api/stripe/webhook — événements Stripe (body BRUT requis pour la signature)
// NB : readRawBody donne la chaîne brute — indispensable pour constructEvent.
import { defineEventHandler, readRawBody, getHeader, createError } from 'h3'
import { pool, query } from '../../services/db'
import { stripe, maybeCreateSellerTransfers, recordStripeFee } from '../../services/stripe'

export default defineEventHandler(async (event) => {
  const sig = getHeader(event, 'stripe-signature') || ''
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let rawBody: string
  try {
    rawBody = (await readRawBody(event, 'utf8')) || ''
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Raw body required' })
  }

  if (!stripe) {
    throw createError({ statusCode: 503, statusMessage: 'Stripe non configuré' })
  }

  let stripeEvent: any
  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    throw createError({ statusCode: 400, statusMessage: `Webhook Error: ${err.message}` })
  }

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object

      // Vérifier si la commande existe déjà (idempotence)
      const existing = await query('SELECT id FROM orders WHERE stripe_session_id = $1 LIMIT 1', [session.id])
      if (existing.rowCount) {
        return { received: true, alreadyProcessed: true }
      }

      const userId = Number(session.metadata?.userId || 0)
      const cartId = Number(session.metadata?.cartId || 0)
      const productSlug = session.metadata?.productSlug || ''

      if (!userId) {
        console.error('Webhook: missing userId in session metadata')
        throw createError({ statusCode: 400, statusMessage: 'Missing userId metadata' })
      }

      // Buy-now : pas de cartId → commande directe depuis le productSlug
      if (!cartId && productSlug) {
        const productResult = await query(
          'SELECT p.*, u.commission_percent AS seller_commission FROM products p JOIN users u ON u.id = p.seller_id WHERE p.slug = $1',
          [productSlug]
        )
        if (!productResult.rowCount) {
          console.error('Webhook buy-now: product not found for slug', productSlug)
          throw createError({ statusCode: 404, statusMessage: 'Product not found' })
        }
        const product = productResult.rows[0]
        const price = Number(product.price)
        const cp = Number(product.seller_commission) || 25
        const fee = Math.round(price * cp) / 100

        const orderInsert = await query(
          `INSERT INTO orders (user_id, stripe_session_id, total_amount, subtotal_amount, status) VALUES ($1,$2,$3,$4,'completed') RETURNING id`,
          [userId, session.id, price, price]
        )
        await query(
          `INSERT INTO order_items (order_id, product_id, seller_id, price, quantity, customer_email, platform_fee_percent, platform_fee_amount, seller_net_amount) VALUES ($1,$2,$3,$4,1,$5,$6,$7,$8)`,
          [orderInsert.rows[0].id, product.id, product.seller_id, price, session.customer_details?.email || '', cp, fee, price - fee]
        )
        console.log(`Webhook buy-now: order ${orderInsert.rows[0].id} created for user ${userId}`)
        await maybeCreateSellerTransfers(orderInsert.rows[0].id, session)
        await recordStripeFee(orderInsert.rows[0].id, session)
        return { received: true, orderId: orderInsert.rows[0].id }
      }

      if (!cartId) {
        console.error('Webhook: missing cartId in session metadata (and no productSlug)')
        throw createError({ statusCode: 400, statusMessage: 'Missing cartId/productSlug metadata' })
      }

      // Checkout panier : transaction complète
      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        const subtotalAmount = Number(session.metadata?.subtotalAmount || 0) || Number(session.amount_subtotal || 0) / 100
        const discountAmount = Number(session.metadata?.discountAmount || 0) || Number(session.total_details?.amount_discount || 0) / 100
        const promoCodeId = Number(session.metadata?.promoCodeId || 0) || null

        const orderInsert = await client.query(
          `INSERT INTO orders (user_id, stripe_session_id, total_amount, subtotal_amount, discount_amount, promo_code_id, status)
           VALUES ($1, $2, $3, $4, $5, $6, 'completed')
           RETURNING id`,
          [userId, session.id, Number(session.amount_total || 0) / 100, subtotalAmount, discountAmount, promoCodeId]
        )
        const orderId = orderInsert.rows[0].id

        const itemsInsert = await client.query(
          `INSERT INTO order_items (order_id, product_id, seller_id, price, quantity, customer_email, platform_fee_percent, platform_fee_amount, seller_net_amount)
           SELECT $1, p.id, p.seller_id, p.price, ci.quantity, $2, u.commission_percent,
             ROUND((p.price * ci.quantity * u.commission_percent / 100)::numeric, 2),
             ROUND((p.price * ci.quantity * (1 - u.commission_percent::numeric / 100))::numeric, 2)
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
           JOIN users u ON u.id = p.seller_id
           WHERE ci.cart_id = $3
           RETURNING id`,
          [orderId, session.customer_details?.email || '', cartId]
        )

        if (!itemsInsert.rowCount) {
          throw new Error('No items to insert for this order')
        }

        if (promoCodeId) {
          const promoUpdate = await client.query(
            `UPDATE promo_codes SET redeemed_count = redeemed_count + 1,
               points_balance = points_balance + GREATEST(points_per_redemption, 0)
             WHERE id = $1 RETURNING points_per_redemption`,
            [promoCodeId]
          )
          const pointsAwarded = Math.max(0, Number(promoUpdate.rows[0]?.points_per_redemption || 0))
          await client.query(
            `INSERT INTO promo_redemptions (promo_code_id, user_id, order_id, discount_amount, order_amount, points_awarded)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [promoCodeId, userId, orderId, discountAmount, Number(session.amount_total || 0) / 100, pointsAwarded]
          )
        }

        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId])
        await client.query('COMMIT')
        console.log(`Webhook: order ${orderId} created for user ${userId}`)
        await maybeCreateSellerTransfers(orderId, session)
        await recordStripeFee(orderId, session)
      } catch (err) {
        await client.query('ROLLBACK')
        console.error('Webhook order creation error:', err)
      } finally {
        client.release()
      }
      break
    }

    case 'account.updated': {
      const account = stripeEvent.data.object
      if (account.charges_enabled) {
        await query(
          'UPDATE users SET stripe_account_id = $1 WHERE email = $2 AND (stripe_account_id IS NULL OR stripe_account_id <> $1)',
          [account.id, account.email || '']
        )
      }
      break
    }

    default:
      console.log(`Unhandled event type: ${stripeEvent.type}`)
  }

  return { received: true }
})
