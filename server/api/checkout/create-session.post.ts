// POST /api/checkout/create-session — session Stripe depuis le panier (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { query } from '../../services/db'
import { getCart, syncClientCart } from '../../services/cart'
import { normalizePromoCode, getValidPromoForCart } from '../../services/promo'
import { stripe, STRIPE_PUBLIC_KEY, PLATFORM_COMMISSION_PERCENT, stripeSafeImage, resolveTransferMode } from '../../services/stripe'

export default defineEventHandler(async (event) => {
  if (!stripe || !STRIPE_PUBLIC_KEY) {
    throw createError({ statusCode: 503, statusMessage: "Stripe n'est pas configuré. Ajoutez STRIPE_SECRET_KEY et STRIPE_PUBLIC_KEY dans l'environnement." })
  }

  try {
    const user = await requireUser(event)
    const body = await readBody(event)

    await syncClientCart(user.id, body?.items)
    const cart = await getCart(user.id)

    if (!cart.items.length) {
      throw createError({ statusCode: 400, statusMessage: 'Votre panier est vide.' })
    }

    // Empêche le rachat d'articles déjà possédés
    const ownedRows = await query(
      `SELECT oi.product_id FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.user_id = $1 AND o.status = 'completed'`,
      [user.id]
    )
    const ownedIds = new Set(ownedRows.rows.map((r: any) => r.product_id))
    if (cart.items.some((it: any) => ownedIds.has(it.product.id))) {
      throw createError({ statusCode: 400, statusMessage: "Vous possédez déjà l'un de ces articles." })
    }

    const promoCode = normalizePromoCode(body?.promoCode)
    const promoState = promoCode ? await getValidPromoForCart(promoCode, cart.total) : null
    if (promoCode && !promoState?.promo) {
      throw createError({ statusCode: 400, statusMessage: 'Code promotionnel invalide, expiré ou déjà utilisé au maximum.' })
    }

    let stripeDiscounts: any = undefined
    if (promoState?.promo && promoState.discountAmount > 0) {
      const couponPayload =
        promoState.promo.discount_type === 'percent'
          ? {
              percent_off: Math.min(100, Number(promoState.promo.discount_value)),
              duration: 'once',
              name: promoState.promo.code,
            }
          : {
              amount_off: Math.round(promoState.discountAmount * 100),
              currency: 'eur',
              duration: 'once',
              name: promoState.promo.code,
            }
      const coupon = await stripe.coupons.create(couponPayload)
      stripeDiscounts = [{ coupon: coupon.id }]
    }

    const lineItems = cart.items.map((item: any) => {
      const previewUrl = item.product.preview?.thumbnail || item.product.preview?.url || ''
      const safeImg = stripeSafeImage(previewUrl)
      return {
        quantity: item.quantity,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(item.product.price) * 100),
          product_data: {
            name: item.product.title,
            images: safeImg ? [previewUrl] : [],
            metadata: {
              productSlug: item.product.slug,
              productId: String(item.product.id),
            },
          },
        },
      }
    })

    const transfer = await resolveTransferMode(cart.items)
    const paidAmount = Math.max(0, Number(cart.total || 0) - Number(promoState?.discountAmount || 0))
    let cartCommission = PLATFORM_COMMISSION_PERCENT
    try {
      const firstSellerId = cart.items[0]?.product?.sellerId
      if (firstSellerId) {
        const cr = await query('SELECT commission_percent FROM users WHERE id = $1', [firstSellerId])
        if (cr.rowCount) cartCommission = Number(cr.rows[0].commission_percent) || PLATFORM_COMMISSION_PERCENT
      }
    } catch { /* fallback commission globale */ }
    const platformFeeCents = Math.round(paidAmount * cartCommission)
    const useDestination = transfer.mode === 'destination' && platformFeeCents > 0 && platformFeeCents < Math.round(paidAmount * 100)

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: lineItems,
      discounts: stripeDiscounts,
      payment_intent_data: useDestination ? {
        transfer_data: { destination: transfer.destination },
        application_fee_amount: platformFeeCents,
      } : undefined,
      success_url: 'https://gca-nuxt.vercel.app/downloads?confirmed=1&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://gca-nuxt.vercel.app/cart?checkout=cancel',
      metadata: {
        userId: String(user.id),
        cartId: String(cart.id),
        promoCodeId: promoState?.promo ? String(promoState.promo.id) : '',
        promoCode: promoState?.promo?.code || '',
        subtotalAmount: String(Math.round(Number(cart.total || 0) * 100) / 100),
        discountAmount: String(promoState?.discountAmount || 0),
        transferMode: useDestination ? 'destination' : 'manual',
      },
    })

    return {
      ok: true,
      sessionId: session.id,
      url: session.url,
      publishableKey: STRIPE_PUBLIC_KEY,
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Stripe checkout error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de créer la session Stripe.' })
  }
})
