// POST /api/auth/register — inscription (réplique du monolithe Express)
// + vérification email : code de validation envoyé par email (Resend) ou
// affiché à l'écran en mode dev (RESEND_API_KEY absent).
import { defineEventHandler, readBody, createError } from 'h3'
import { randomInt } from 'node:crypto'
import { query } from '../../services/db'
import { hashPassword, slugify, sanitizeUser } from '../../services/users'
import { createSession } from '../../services/session'
import { sendEmail, verificationEmailHtml } from '../../services/email'

export default defineEventHandler(async (event) => {
  const { email, password, displayName, preferredLanguage, role, sellerDescription, shopName, discordTag } = await readBody(event)

  if (!email || !password || !displayName) {
    throw createError({ statusCode: 400, statusMessage: 'email, password and displayName are required' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()

  const existing = await query('SELECT id FROM users WHERE email = $1', [normalizedEmail])
  if (existing.rowCount) {
    throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
  }

  // Garantit les colonnes de vérification email (init DB récente)
  try {
    await query(
      `ALTER TABLE users
       ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE,
       ADD COLUMN IF NOT EXISTS email_verification_code TEXT,
       ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMPTZ`
    )
  } catch { /* non bloquant */ }

  // Inscription vendeur -> status 'pending', rôle customer (approbation admin ensuite)
  const isSeller = role === 'seller'
  const sellerStatus = isSeller ? 'pending' : 'none'

  const verificationCode = String(randomInt(100000, 999999))
  const codeExpires = new Date(Date.now() + 30 * 60 * 1000) // 30 min

  const inserted = await query(
    `INSERT INTO users (email, password_hash, display_name, slug, role, preferred_language, seller_status, seller_description, shop_name, discord_tag, email_verified, email_verification_code, email_verification_expires)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, FALSE, $11, $12)
     RETURNING *`,
    [
      normalizedEmail,
      hashPassword(password),
      String(displayName).trim(),
      `${slugify(displayName)}-${Date.now()}`,
      'customer',
      preferredLanguage === 'en' ? 'en' : 'fr',
      sellerStatus,
      String(sellerDescription || '').trim(),
      String(shopName || '').trim(),
      String(discordTag || '').trim(),
      verificationCode,
      codeExpires,
    ]
  )

  const user = sanitizeUser(inserted.rows[0])
  await createSession(event, user)

  // Envoi du code par email ; en mode dev (pas de RESEND_API_KEY) on le renvoie
  // dans la réponse pour permettre la validation.
  const emailSent = await sendEmail(
    normalizedEmail,
    'Vérifiez votre adresse email — GSA Store',
    verificationEmailHtml(verificationCode)
  )

  return {
    ok: true,
    user,
    sellerPending: isSeller,
    needsVerification: true,
    devCode: emailSent ? undefined : verificationCode,
  }
})
