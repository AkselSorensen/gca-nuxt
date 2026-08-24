// POST /api/auth/register — inscription (réplique du monolithe Express)
import { defineEventHandler, readBody, createError } from 'h3'
import { query } from '../../services/db'
import { hashPassword, slugify, sanitizeUser } from '../../services/users'
import { createSession } from '../../services/session'

export default defineEventHandler(async (event) => {
  const { email, password, displayName, preferredLanguage, role, sellerDescription, shopName, discordTag } = await readBody(event)

  if (!email || !password || !displayName) {
    throw createError({ statusCode: 400, statusMessage: 'email, password and displayName are required' })
  }

  const existing = await query('SELECT id FROM users WHERE email = $1', [String(email).trim().toLowerCase()])
  if (existing.rowCount) {
    throw createError({ statusCode: 409, statusMessage: 'Email already in use' })
  }

  // Inscription vendeur -> status 'pending', rôle customer (approbation admin ensuite)
  const isSeller = role === 'seller'
  const sellerStatus = isSeller ? 'pending' : 'none'

  const inserted = await query(
    `INSERT INTO users (email, password_hash, display_name, slug, role, preferred_language, seller_status, seller_description, shop_name, discord_tag)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      String(email).trim().toLowerCase(),
      hashPassword(password),
      String(displayName).trim(),
      `${slugify(displayName)}-${Date.now()}`,
      'customer',
      preferredLanguage === 'en' ? 'en' : 'fr',
      sellerStatus,
      String(sellerDescription || '').trim(),
      String(shopName || '').trim(),
      String(discordTag || '').trim(),
    ]
  )

  const user = sanitizeUser(inserted.rows[0])
  await createSession(event, user)

  return { ok: true, user, sellerPending: isSeller }
})
