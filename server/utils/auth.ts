// Middleware : session & gardes d'authentification pour les routes Nitro.
// Compatible avec les sessions express-session (connect-pg-simple, table
// `user_sessions`, cookie `connect.sid`) créées par le monolithe Express.
import { createError } from 'h3'
import type { H3Event } from 'h3'
import { pool } from '../services/db'
import { getSessionId } from '../services/session'

export interface SessionUser {
  id: number
  email?: string
  role?: string
  slug?: string
  displayName?: string
  [key: string]: any
}

export async function getSessionUser(event: H3Event): Promise<SessionUser | null> {
  try {
    const sid = getSessionId(event)
    if (!sid) return null
    const r = await pool.query('SELECT sess FROM user_sessions WHERE sid = $1', [sid])
    if (!r.rowCount) return null
    return r.rows[0].sess?.user || null
  } catch {
    return null
  }
}

export async function requireUser(event: H3Event): Promise<SessionUser> {
  const user = await getSessionUser(event)
  if (!user?.id) throw createError({ statusCode: 401, statusMessage: 'Non connecté', message: 'Non connecté' })
  return user
}

export async function requireAdmin(event: H3Event): Promise<SessionUser> {
  const user = await requireUser(event)
  if (user.role !== 'admin') throw createError({ statusCode: 403, statusMessage: 'Accès refusé', message: 'Accès administrateur requis' })
  return user
}

// Locale stockée dans la session (req.session.locale côté Express)
export async function getSessionLocale(event: H3Event): Promise<string> {
  try {
    const sid = getSessionId(event)
    if (!sid) return 'fr'
    const r = await pool.query('SELECT sess FROM user_sessions WHERE sid = $1', [sid])
    return r.rows[0]?.sess?.locale || 'fr'
  } catch {
    return 'fr'
  }
}
