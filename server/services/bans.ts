// Bannissement de comptes : colonnes ajoutées à la demande + déconnexion immédiate de l'utilisateur banni.
import { query } from './db'

let ready = false
export async function ensureBanColumns() {
  if (ready) return
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT FALSE')
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ')
  await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT')
  ready = true
}

/** Supprime toutes les sessions ouvertes de l'utilisateur (il est déconnecté au prochain appel). */
export async function purgeUserSessions(userId: number) {
  try {
    await query(`DELETE FROM user_sessions WHERE (sess::jsonb)->'user'->>'id' = $1`, [String(userId)])
  } catch (e: any) {
    console.error('[ban] purge des sessions impossible :', e?.message || e)
  }
}
