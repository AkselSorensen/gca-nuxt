// POST /api/admin/seller-requests/:id/approve — approuver un vendeur (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { sendEmail } from '../../../../services/email'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const userId = Number(getRouterParam(event, 'id'))
    if (!userId) throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })

    const result = await query(
      `UPDATE users SET seller_status = 'approved', role = 'seller'
       WHERE id = $1 AND seller_status = 'pending'
       RETURNING id, email, display_name, slug, role, seller_status`,
      [userId]
    )

    if (!result.rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Demande introuvable ou déjà traitée' })
    }

    // Notification email (si RESEND_API_KEY configuré)
    const approved = result.rows[0]
    await sendEmail(
      approved.email,
      'Votre compte vendeur est activé — GSA Store',
      `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
        <h2 style="margin:0 0 12px;color:#11171f">Félicitations ${approved.display_name || ''} ! 🎉</h2>
        <p style="color:#5a6478;font-size:14px;line-height:1.6">Votre demande de compte vendeur a été <strong>approuvée</strong>. Vous pouvez dès maintenant publier vos créations et suivre vos revenus depuis votre espace vendeur.</p>
        <p style="text-align:center;margin:20px 0"><a href="https://gca-nuxt.vercel.app/seller/account" style="background:#2f7df6;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700">Accéder à mon espace vendeur</a></p>
      </div>`
    )

    return { ok: true, user: approved }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Approve seller error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to approve seller' })
  }
})
