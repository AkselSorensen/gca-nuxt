// Mode maintenance : seuls les admins peuvent ouvrir une session.
import { createError } from 'h3'
import { query } from './db'

export async function isMaintenanceOn(): Promise<boolean> {
  try {
    const result = await query("SELECT value FROM settings WHERE key = 'maintenance_mode'")
    return result.rows[0]?.value === 'true'
  } catch {
    return false
  }
}

/** Refuse la connexion / inscription d'un non-admin pendant la maintenance. */
export async function assertCanSignIn(role?: string | null) {
  if (role === 'admin') return
  if (await isMaintenanceOn()) {
    throw createError({ statusCode: 503, statusMessage: 'Service en maintenance', data: { message: 'Site en maintenance : seule la connexion administrateur est disponible.' } })
  }
}
