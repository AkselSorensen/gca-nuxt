// POST /api/admin/promo-codes — création (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'
import { normalizePromoCode, generatePromoCode } from '../../../services/promo'

export default defineEventHandler(async (event) => {
  const user = await requireAdmin(event)
  const body = await readBody(event)

  const ambassadorName = String(body.ambassadorName || '').trim()
  const ambassadorContact = String(body.ambassadorContact || '').trim()
  const discountType = body.discountType === 'fixed' ? 'fixed' : 'percent'
  const discountValue = Number(body.discountValue || 0)
  const pointsPerRedemption = Math.max(0, Number(body.pointsPerRedemption || 1))
  const rewardNote = String(body.rewardNote || '').trim()
  const maxRedemptions = body.maxRedemptions ? Number(body.maxRedemptions) : null
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
  const requestedCode = normalizePromoCode(body.code)
  const code = requestedCode || generatePromoCode(ambassadorName || 'AMB')

  if (!ambassadorName || !discountValue || discountValue <= 0 || (discountType === 'percent' && discountValue > 100)) {
    throw createError({ statusCode: 400, statusMessage: 'Ambassadeur et réduction valide requis.' })
  }

  try {
    const result = await query(
      `
        INSERT INTO promo_codes (
          code,
          label,
          ambassador_name,
          ambassador_contact,
          discount_type,
          discount_value,
          points_per_redemption,
          reward_note,
          max_redemptions,
          expires_at,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `,
      [
        code,
        String(body.label || `Code ambassadeur ${ambassadorName}`).trim(),
        ambassadorName,
        ambassadorContact,
        discountType,
        discountValue,
        pointsPerRedemption,
        rewardNote,
        maxRedemptions,
        expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
        user.id,
      ]
    )
    return { ok: true, code: result.rows[0].code, promoCode: result.rows[0] }
  } catch (error: any) {
    if (error?.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Ce code promo existe déjà.' })
    }
    console.error('Admin create promo code error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to create promo code' })
  }
})
