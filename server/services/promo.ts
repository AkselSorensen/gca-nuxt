// Service : codes promo (réplique du monolithe Express)
import { query } from './db'

export function normalizePromoCode(code: string): string {
  return String(code || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 40)
}

export function calculatePromoDiscount(cartTotal: number, promo: any): number {
  const total = Math.max(0, Number(cartTotal || 0))
  if (!promo || total <= 0) return 0
  const value = Math.max(0, Number(promo.discount_value || 0))
  const rawDiscount = promo.discount_type === 'fixed' ? value : total * (Math.min(100, value) / 100)
  return Math.min(total, Math.round(rawDiscount * 100) / 100)
}

export async function getValidPromoForCart(code: string, cartTotal: number) {
  const normalizedCode = normalizePromoCode(code)
  if (!normalizedCode) {
    return { promo: null, discountAmount: 0, finalTotal: Number(cartTotal || 0) }
  }

  const promoResult = await query(
    `
      SELECT *
      FROM promo_codes
      WHERE code = $1
        AND is_active = TRUE
        AND (starts_at IS NULL OR starts_at <= NOW())
        AND (expires_at IS NULL OR expires_at >= NOW())
        AND (max_redemptions IS NULL OR redeemed_count < max_redemptions)
      LIMIT 1
    `,
    [normalizedCode]
  )

  if (!promoResult.rowCount) return null

  const promo = promoResult.rows[0]
  const discountAmount = calculatePromoDiscount(cartTotal, promo)
  const finalTotal = Math.max(0, Number(cartTotal || 0) - discountAmount)

  return {
    promo,
    discountAmount,
    finalTotal: Math.round(finalTotal * 100) / 100,
  }
}
