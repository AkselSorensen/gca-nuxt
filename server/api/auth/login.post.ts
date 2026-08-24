// POST /api/auth/login — connexion (réplique du monolithe Express)
import { defineEventHandler, readBody, createError } from 'h3'
import { query } from '../../services/db'
import { hashPassword, sanitizeUser } from '../../services/users'
import { createSession } from '../../services/session'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'email and password are required' })
  }

  const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [
    String(email).trim().toLowerCase(),
  ])

  if (!result.rowCount || result.rows[0].password_hash !== hashPassword(password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const user = sanitizeUser(result.rows[0])
  await createSession(event, user)

  return { ok: true, user }
})
