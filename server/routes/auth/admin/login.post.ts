// POST /auth/admin/login — connexion admin (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { query } from '../../../services/db'
import { hashPassword, slugify, sanitizeUser } from '../../../services/users'
import { createSession } from '../../../services/session'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gstore.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid admin credentials' })
  }

  // S'assure que le compte admin existe avec le bon rôle
  const adminSlug = slugify(ADMIN_EMAIL.split('@')[0] || 'admin')
  await query(
    `
      INSERT INTO users (email, password_hash, display_name, slug, role, preferred_language)
      VALUES ($1, $2, $3, $4, 'admin', 'fr')
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          display_name = EXCLUDED.display_name,
          slug = EXCLUDED.slug,
          role = 'admin'
    `,
    [ADMIN_EMAIL, hashPassword(ADMIN_PASSWORD), 'GSA Admin', adminSlug]
  )

  const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [ADMIN_EMAIL])
  const user = sanitizeUser(result.rows[0])
  await createSession(event, user)

  return { ok: true, user }
})
