// POST /api/checkout/buy-now — achat direct d'un produit (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { query } from '../../services/db'
import { stripe, STRIPE_PUBLIC_KEY, PLATFORM_COMMISSION_PERCENT, stripeSafeImage, resolveTransferMode } from '../../services/stripe'

export default defineEventHandler(async (event) => {
  if (!stripe || !STRIPE_PUBLIC_KEY) {
    throw createError({ statusCode: 503, statusMessage: "Stripe n'est pas configuré." })
  }
  try {
    const user = await requireUser(event)
    const { slug } = await readBody(event)
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug du produit requis' })

    const prodResult = await query(
      'SELECT p.*, u.stripe_account_id AS seller_stripe_id, u.commission_percent AS seller_commission FROM products p JOIN users u ON u.id = p.seller_id WHERE p.slug = $1',
      [slug]
    )
    if (!prodResult.rowCount) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
    const product = prodResult.rows[0]

    // Empêche un vendeur d'acheter ses propres produits
    if (Number(product.seller_id) === Number(user.id)) {
      throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas acheter vos propres produits.' })
    }

    // Empêche le rachat d'un produit déjà possédé
    const ownedCheck = await query(
      `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = 'completed' LIMIT 1`,
      [product.id, user.id]
    )
    if (ownedCheck.rowCount) {
      throw createError({ statusCode: 400, statusMessage: 'Vous possédez déjà ce produit.' })
    }

    const unitAmount = Math.round(Number(product.price) * 100)

    const transfer = await resolveTransferMode([{ product: { sellerId: product.seller_id } }])
    const sellerCommission = Number(product.seller_commission) || PLATFORM_COMMISSION_PERCENT
    const platformFeeCents = Math.round(Number(product.price) * sellerCommission)
    const useDestination = transfer.mode === 'destination' && platformFeeCents < unitAmount

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: unitAmount,
          product_data: {
            name: product.title,
            images: (() => { const img = stripeSafeImage(product.thumbnail); return img ? [img] : [] })(),
            metadata: { productSlug: product.slug, productId: String(product.id) },
          },
        },
      }],
      payment_intent_data: useDestination ? {
        transfer_data: { destination: transfer.destination },
        application_fee_amount: platformFeeCents,
      } : undefined,
      success_url: `${process.env.APP_BASE_URL || 'https://gsa-store.fr'}/downloads?confirmed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL || 'https://gsa-store.fr'}/product/${slug}`,
      metadata: { userId: String(user.id), productSlug: product.slug, transferMode: useDestination ? 'destination' : 'manual' },
    })

    return { url: session.url }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Buy-now error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la création du paiement' })
  }
})
