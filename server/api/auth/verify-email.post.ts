// POST /api/auth/verify-email — valider le code reçu par email
import { defineEventHandler, readBody, createError } from 'h3'
import { query } from '../../services/db'
import { sanitizeUser } from '../../services/users'
import { updateSessionUser } from '../../services/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const email = String(body?.email || '').trim().toLowerCase()
  const code = String(body?.code || '').trim()

  if (!email || !code) {
    throw createError({ statusCode: 400, statusMessage: 'Email et code requis' })
  }

  const result = await query(
    `SELECT id, email_verified, email_verification_code, email_verification_expires FROM users WHERE email = $1`,
    [email]
  )
  if (!result.rowCount) {
    throw createError({ statusCode: 404, statusMessage: 'Compte introuvable' })
  }

  const row = result.rows[0]
  if (row.email_verified) {
    return { ok: true, verified: true }
  }
  if (!row.email_verification_code || row.email_verification_code !== code) {
    throw createError({ statusCode: 400, statusMessage: 'Code invalide' })
  }
  if (!row.email_verification_expires || new Date(row.email_verification_expires) < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'Code expiré' })
  }

  const updated = await query(
    `UPDATE users
     SET email_verified = TRUE, email_verification_code = NULL, email_verification_expires = NULL
     WHERE id = $1
     RETURNING *`,
    [row.id]
  )

  // Met à jour la session courante si elle existe
  const sanitized = sanitizeUser(updated.rows[0])
  await updateSessionUser(event, sanitized)

  return { ok: true, verified: true, user: sanitized }
})
