// POST /api/admin/seller-requests/:id/refuse — refuse une demande vendeur
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { sendEmail } from '../../../../services/email'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))

  const result = await query(
    `UPDATE users SET seller_status = 'refused'
     WHERE id = $1 AND seller_status = 'pending'
     RETURNING id, email, display_name`,
    [userId]
  )

  if (!result.rowCount) {
    throw createError({ statusCode: 404, statusMessage: 'Demande introuvable ou déjà traitée' })
  }

  // Notification email (si RESEND_API_KEY configuré)
  const refused = result.rows[0]
  await sendEmail(
    refused.email,
    'Votre demande de compte vendeur — GSA Store',
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px">
      <h2 style="margin:0 0 12px;color:#11171f">Votre demande n'a pas été retenue</h2>
      <p style="color:#5a6478;font-size:14px;line-height:1.6">Bonjour ${refused.display_name || ''},</p>
      <p style="color:#5a6478;font-size:14px;line-height:1.6">Votre demande de compte vendeur sur <strong>GSA Store</strong> n'a pas été validée pour le moment. Vous pouvez corriger les informations de votre candidature et <strong>faire une nouvelle demande</strong> depuis votre profil.</p>
      <p style="color:#5a6478;font-size:14px;line-height:1.6">Pour toute question, rejoignez-nous sur le serveur Discord GSA.</p>
      <p style="color:#98a2b3;font-size:12px;margin-top:24px">GSA Store — L'équipe</p>
    </div>`
  ).catch(() => {})

  return { ok: true, message: 'Demande refusée' }
})
