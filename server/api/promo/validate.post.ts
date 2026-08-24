// POST /api/promo/validate — valider un code promo (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { getCart, syncClientCart } from '../../services/cart'
import { getValidPromoForCart } from '../../services/promo'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    const body = await readBody(event)
    await syncClientCart(user.id, body?.items)
    const cart = await getCart(user.id)
    const promoState = await getValidPromoForCart(body?.code, cart.total)

    if (!promoState?.promo) {
      throw createError({ statusCode: 404, statusMessage: 'Code promotionnel invalide, expiré ou déjà utilisé au maximum.' })
    }

    return {
      ok: true,
      code: promoState.promo.code,
      label: promoState.promo.label,
      ambassadorName: promoState.promo.ambassador_name,
      discountType: promoState.promo.discount_type,
      discountValue: Number(promoState.promo.discount_value),
      subtotal: cart.total,
      discountAmount: promoState.discountAmount,
      finalTotal: promoState.finalTotal,
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Promo validate error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible de vérifier le code promo.' })
  }
})
