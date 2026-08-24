// Service : sessions compatibles express-session (connect-pg-simple).
// Même table (user_sessions), même cookie signé (connect.sid = "s:<sid>.<sig>")
// que le monolithe Express — les sessions créées ici sont lisibles par les
// routes monolithe et inversement.
import { randomBytes } from 'node:crypto'
import { getCookie, setCookie, deleteCookie } from 'h3'
import type { H3Event } from 'h3'
import { sign, unsign } from 'cookie-signature'
import { query } from './db'

const COOKIE_NAME = 'connect.sid'
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret'
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  path: '/',
  maxAge: MAX_AGE_MS / 1000,
}

export function createSid(): string {
  // 24 chars, base64url — même format que le genid par défaut d'express-session
  return randomBytes(18).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Lit le cookie et retourne le sid BRUT (dé-signé), ou null
export function getSessionId(event: H3Event): string | null {
  const raw = getCookie(event, COOKIE_NAME)
  if (!raw) return null
  if (raw.startsWith('s:')) {
    const val = unsign(raw.slice(2), SESSION_SECRET)
    return val === false ? null : val
  }
  return raw // cookie non signé (compat ancienne)
}

export async function createSession(event: H3Event, user: any): Promise<string> {
  const sid = createSid()
  const expires = new Date(Date.now() + MAX_AGE_MS)
  const sess = {
    cookie: {
      originalMaxAge: MAX_AGE_MS,
      expires: expires.toISOString(),
      httpOnly: true,
      path: '/',
      sameSite: 'none',
      secure: true,
    },
    user,
  }
  await query(
    `INSERT INTO user_sessions (sid, sess, expire) VALUES ($1, $2::json, $3)
     ON CONFLICT (sid) DO UPDATE SET sess = EXCLUDED.sess, expire = EXCLUDED.expire`,
    [sid, JSON.stringify(sess), expires]
  )
  setCookie(event, COOKIE_NAME, `s:${sign(sid, SESSION_SECRET)}`, COOKIE_OPTS)
  return sid
}

export async function destroySession(event: H3Event): Promise<void> {
  const sid = getSessionId(event)
  if (sid) {
    try { await query('DELETE FROM user_sessions WHERE sid = $1', [sid]) } catch { /* ignore */ }
  }
  deleteCookie(event, COOKIE_NAME, { httpOnly: true, sameSite: 'none', secure: true, path: '/' })
}
