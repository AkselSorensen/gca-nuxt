// GET /auth/steam/callback — retour OpenID Steam (réplique du monolithe)
import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { query } from '../../../services/db'
import { hashPassword, slugify, sanitizeUser } from '../../../services/users'
import { createSession, updateSessionUser } from '../../../services/session'
import { getSessionUser } from '../../../utils/auth'

const BASE_URL = process.env.APP_BASE_URL || 'https://gca-nuxt.vercel.app'
const STEAM_API_KEY = process.env.STEAM_API_KEY || ''

export default defineEventHandler(async (event) => {
  try {
    const queryParams = getQuery(event)
    const claimedId = String(queryParams['openid.claimed_id'] || queryParams['openid.identity'] || '')
    const steamIdMatch = claimedId.match(/(\d{17})/)

    if (!claimedId || !steamIdMatch) {
      throw new Error(`Steam claimed_id missing or invalid: ${claimedId || 'undefined'}`)
    }

    const steamId = steamIdMatch[1]

    let profile: any = null
    if (STEAM_API_KEY) {
      const steamProfileResponse = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${encodeURIComponent(STEAM_API_KEY)}&steamids=${encodeURIComponent(steamId)}`
      )
      if (steamProfileResponse.ok) {
        const steamProfilePayload = await steamProfileResponse.json()
        profile = steamProfilePayload.response?.players?.[0] || null
      }
    }

    const email = `${steamId}@steam.gsa.local`
    const displayName = profile?.personaname || `Steam ${steamId}`
    const avatarUrl = profile?.avatarfull || profile?.avatar || null

    // Si déjà connecté → mode liaison (Steam)
    const sessionUser = await getSessionUser(event)
    if (sessionUser?.id) {
      await query(
        `UPDATE users SET steam_id = $1, avatar_url = COALESCE(NULLIF(avatar_url, ''), $2) WHERE id = $3`,
        [steamId, avatarUrl, sessionUser.id]
      )
      const updated = await query('SELECT * FROM users WHERE id = $1', [sessionUser.id])
      await updateSessionUser(event, sanitizeUser(updated.rows[0]))
      return sendRedirect(event, `${BASE_URL}/seller/account?steam_id=${steamId}`)
    }

    const existing = await query('SELECT * FROM users WHERE steam_id = $1 OR email = $2 LIMIT 1', [steamId, email])
    let userRow: any

    if (existing.rowCount) {
      userRow = existing.rows[0]
      await query(
        `UPDATE users SET display_name = $2, avatar_url = $3, steam_id = $4 WHERE id = $1`,
        [userRow.id, displayName, avatarUrl, steamId]
      )
      const updated = await query('SELECT * FROM users WHERE id = $1', [userRow.id])
      userRow = updated.rows[0]
    } else {
      const inserted = await query(
        `INSERT INTO users (email, password_hash, display_name, slug, role, avatar_url, steam_id, preferred_language)
         VALUES ($1, $2, $3, $4, 'customer', $5, $6, 'fr')
         RETURNING *`,
        [email, hashPassword(`steam-${steamId}`), displayName, `${slugify(displayName)}-${steamId}`, avatarUrl, steamId]
      )
      userRow = inserted.rows[0]
    }

    await createSession(event, sanitizeUser(userRow))
    return sendRedirect(event, `${BASE_URL}/`)
  } catch (error) {
    console.error('Steam auth error:', error)
    return sendRedirect(event, `${BASE_URL}/login?error=steam_auth_failed`)
  }
})
