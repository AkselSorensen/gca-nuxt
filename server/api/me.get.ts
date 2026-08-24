// GET /api/me — utilisateur courant (réplique du monolithe Express)
import { defineEventHandler, createError } from 'h3'
import { query } from '../services/db'
import { sanitizeUser } from '../services/users'
import { getSessionUser } from '../utils/auth'

export default defineEventHandler(async (event) => {
  const sessionUser = await getSessionUser(event)
  if (!sessionUser?.id) {
    return { authenticated: false, user: null, cart: null }
  }

  try {
    // Rafraîchir l'utilisateur depuis la DB (champs à jour, slug, rôle…)
    const userResult = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [sessionUser.id])
    const user = userResult.rowCount ? sanitizeUser(userResult.rows[0]) : sessionUser
    return { authenticated: true, user, cart: null }
  } catch (error) {
    console.error('Me error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to load session' })
  }
})
