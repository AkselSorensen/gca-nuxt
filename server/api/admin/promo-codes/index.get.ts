// GET /api/admin/promo-codes — liste (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const result = await query(
      `
        SELECT
          pc.*,
          COALESCE(SUM(pr.discount_amount), 0) AS total_discount_amount,
          COALESCE(SUM(pr.order_amount), 0) AS total_order_amount,
          COALESCE(SUM(pr.points_awarded), 0) AS total_points_awarded,
          COUNT(pr.id)::int AS referral_count
        FROM promo_codes pc
        LEFT JOIN promo_redemptions pr ON pr.promo_code_id = pc.id
        GROUP BY pc.id
        ORDER BY pc.created_at DESC, pc.id DESC
      `
    )
    return {
      items: result.rows.map((row: any) => ({
        id: row.id,
        code: row.code,
        label: row.label,
        ambassadorName: row.ambassador_name,
        ambassadorContact: row.ambassador_contact,
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        pointsPerRedemption: Number(row.points_per_redemption || 0),
        pointsBalance: Number(row.points_balance || 0),
        pointsRedeemed: Number(row.points_redeemed || 0),
        rewardNote: row.reward_note || '',
        maxRedemptions: row.max_redemptions,
        redeemedCount: row.redeemed_count,
        referralCount: Number(row.referral_count || 0),
        isActive: row.is_active,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
        totalDiscountAmount: Number(row.total_discount_amount || 0),
        totalOrderAmount: Number(row.total_order_amount || 0),
        totalPointsAwarded: Number(row.total_points_awarded || 0),
      })),
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin promo codes error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch promo codes' })
  }
})
