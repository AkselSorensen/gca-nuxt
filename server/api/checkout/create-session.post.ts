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

    // Empêche l'achat de ses propres produits
    const cartProductRows = await query(
      'SELECT id, seller_id FROM products WHERE id = ANY($1::int[])',
      [cart.items.map((i: any) => i.product.id)]
    )
    const ownIds = cartProductRows.rows
      .filter((r: any) => Number(r.seller_id) === Number(user.id))
      .map((r: any) => r.id)
    if (ownIds.length) {
      throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas acheter vos propres produits.' })
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
    const cartTotal = Number(cart.total || 0)
    const paidAmount = Math.max(0, cartTotal - Number(promoState?.discountAmount || 0))

    // Commission = SOMME article par article (chaque produit a SON taux).
    // Avant : on prenait le taux du 1er article et on l'appliquait à tout le panier
    // → 200 € avec un produit à 75 % donnait 150 € de frais au lieu de 75 € + 25 €.
    let platformFeeCents = 0
    try {
      const ids = cart.items.map((it: any) => Number(it.product?.id)).filter(Boolean)
      const rates = new Map<number, number>()
      if (ids.length) {
        const cr = await query('SELECT id, commission_percent FROM products WHERE id = ANY($1)', [ids])
        for (const row of cr.rows) {
          rates.set(Number(row.id), row.commission_percent === null ? PLATFORM_COMMISSION_PERCENT : Number(row.commission_percent))
        }
      }
      let feeEuros = 0
      for (const it of cart.items) {
        const pct = rates.get(Number(it.product?.id)) ?? PLATFORM_COMMISSION_PERCENT
        const lineTotal = Number(it.product?.price || 0) * Number(it.quantity || 1)
        feeEuros += (lineTotal * pct) / 100
      }
      // Remise éventuelle : on réduit la commission au prorata du montant réellement payé
      const ratio = cartTotal > 0 ? paidAmount / cartTotal : 1
      platformFeeCents = Math.round(feeEuros * ratio * 100)
    } catch (e: any) {
      console.error('[checkout] calcul commission panier:', e?.message || e)
      platformFeeCents = Math.round(paidAmount * PLATFORM_COMMISSION_PERCENT)
    }
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
      success_url: `${process.env.APP_BASE_URL || 'https://gsa-store.fr'}/downloads?confirmed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL || 'https://gsa-store.fr'}/cart?checkout=cancel`,
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
