import { defineEventHandler, getQuery, createError } from 'h3'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sessionId = query.session_id as string

  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'session_id requis' })
  }

  // Check if order already exists
  const existing = await pool.query(
    'SELECT id FROM orders WHERE stripe_session_id = $1 LIMIT 1',
    [sessionId]
  )
  if (existing.rowCount) {
    return { ok: true, orderId: existing.rows[0].id, alreadyConfirmed: true }
  }

  // Get user from session (cookie)
  // In Nuxt, we can access the session via event.context.session
  // But for simplicity, we'll use the cookie directly

  // Find the product from the Stripe session metadata
  // For now, let's use the real Stripe API to retrieve the session
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    // Only confirm paid sessions
    if (session.payment_status !== 'paid') {
      throw createError({ statusCode: 400, statusMessage: 'Paiement non validé' })
    }

    const userId = Number(session.metadata?.userId)
    const productSlug = session.metadata?.productSlug

    if (!userId || !productSlug) {
      throw createError({ statusCode: 400, statusMessage: 'Métadonnées manquantes' })
    }

    const prod = await pool.query('SELECT * FROM products WHERE slug = $1', [productSlug])
    if (!prod.rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
    }

    const product = prod.rows[0]
    const cp = Number(process.env.PLATFORM_COMMISSION_PERCENT || 25)
    const price = Number(product.price)
    const fee = Math.round(price * cp / 100 * 100) / 100

    const ord = await pool.query(
      `INSERT INTO orders (user_id, stripe_session_id, total_amount, subtotal_amount, status)
       VALUES ($1, $2, $3, $4, 'completed') RETURNING id`,
      [userId, sessionId, price, price]
    )

    await pool.query(
      `INSERT INTO order_items (order_id, product_id, seller_id, price, quantity, customer_email, platform_fee_percent, platform_fee_amount, seller_net_amount)
       VALUES ($1, $2, $3, $4, 1, $5, $6, $7, $8)`,
      [ord.rows[0].id, product.id, product.seller_id, price, session.customer_email || '', cp, fee, price - fee]
    )

    return { ok: true, orderId: ord.rows[0].id }
  } catch (e: any) {
    console.error('Nitro confirm error:', e)
    throw createError({ statusCode: 500, statusMessage: e.message || 'Erreur de confirmation' })
  }
})
