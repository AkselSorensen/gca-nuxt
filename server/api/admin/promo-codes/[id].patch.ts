// PATCH /api/admin/promo-codes/:id — mise à jour (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const promoCodeId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(promoCodeId)) throw createError({ statusCode: 400, statusMessage: 'Invalid promo code id' })

  const body = await readBody(event)
  const updates: string[] = []
  const values: any[] = []
  let idx = 1

  if (body.isActive !== undefined) { updates.push(`is_active = $${idx++}`); values.push(Boolean(body.isActive)) }
  if (body.rewardNote !== undefined) { updates.push(`reward_note = $${idx++}`); values.push(String(body.rewardNote || '').trim()) }
  if (body.ambassadorContact !== undefined) { updates.push(`ambassador_contact = $${idx++}`); values.push(String(body.ambassadorContact || '').trim()) }
  if (body.pointsPerRedemption !== undefined) { updates.push(`points_per_redemption = $${idx++}`); values.push(Math.max(0, Number(body.pointsPerRedemption || 0))) }
  if (body.redeemPoints !== undefined) {
    const redeemPoints = Math.max(0, Number(body.redeemPoints || 0))
    updates.push(`points_balance = GREATEST(points_balance - $${idx}, 0)`); values.push(redeemPoints); idx += 1
    updates.push(`points_redeemed = points_redeemed + $${idx}`); values.push(redeemPoints); idx += 1
  }

  if (!updates.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

  try {
    values.push(promoCodeId)
    const result = await query(`UPDATE promo_codes SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values)
    if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Code ambassadeur introuvable.' })
    return { ok: true, promoCode: result.rows[0] }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin update promo code error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update promo code' })
  }
})
