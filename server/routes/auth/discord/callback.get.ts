// GET /auth/discord/callback — retour OAuth Discord (réplique du monolithe)
import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { query } from '../../../services/db'
import { hashPassword, slugify, sanitizeUser } from '../../../services/users'
import { createSession, updateSessionUser } from '../../../services/session'
import { getSessionUser } from '../../../utils/auth'

const BASE_URL = process.env.APP_BASE_URL || 'https://gca-nuxt.vercel.app'
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)

  if (!code) {
    return sendRedirect(event, `${BASE_URL}/login?error=missing_code`)
  }

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID || '',
        client_secret: DISCORD_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        code: String(code),
        redirect_uri: DISCORD_REDIRECT_URI || '',
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error('Unable to retrieve Discord token')
    }

    const tokenData = await tokenResponse.json()

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error('Unable to retrieve Discord profile')
    }

    const discordUser = await userResponse.json()
    const email = discordUser.email || `${discordUser.id}@discord.gsa.local`
    const displayName = discordUser.global_name || discordUser.username
    const avatarUrl = discordUser.avatar
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      : null

    // Si déjà connecté → mode liaison
    const sessionUser = await getSessionUser(event)
    if (sessionUser?.id) {
      await query(
        `UPDATE users SET discord_id = $1, avatar_url = COALESCE(NULLIF(avatar_url, ''), $2) WHERE id = $3`,
        [String(discordUser.id), avatarUrl, sessionUser.id]
      )
      const updated = await query('SELECT * FROM users WHERE id = $1', [sessionUser.id])
      await updateSessionUser(event, sanitizeUser(updated.rows[0]))
      let redirectAfterLink = `${BASE_URL}/profile`
      try {
        const s = String(getQuery(event).state || '')
        if (s) {
          const decoded = Buffer.from(s, 'base64').toString('utf8')
          if (decoded.startsWith('http') || decoded.startsWith('/')) redirectAfterLink = decoded
        }
      } catch { /* ignore */ }
      const sep = redirectAfterLink.includes('?') ? '&' : '?'
      redirectAfterLink += `${sep}discord_id=${discordUser.id}&discord_username=${discordUser.username}`
      return sendRedirect(event, redirectAfterLink)
    }

    const existing = await query('SELECT * FROM users WHERE discord_id = $1 OR email = $2 LIMIT 1', [
      String(discordUser.id),
      email,
    ])
    let userRow: any

    if (existing.rowCount) {
      userRow = existing.rows[0]
      await query(
        `UPDATE users SET display_name = $2, avatar_url = $3, discord_id = $4 WHERE id = $1`,
        [userRow.id, displayName, avatarUrl, String(discordUser.id)]
      )
      const updated = await query('SELECT * FROM users WHERE id = $1', [userRow.id])
      userRow = updated.rows[0]
    } else {
      const inserted = await query(
        `INSERT INTO users (email, password_hash, display_name, slug, role, avatar_url, discord_id, preferred_language)
         VALUES ($1, $2, $3, $4, 'customer', $5, $6, 'fr')
         RETURNING *`,
        [email, hashPassword(`discord-${discordUser.id}`), displayName, `${slugify(displayName)}-${discordUser.id}`, avatarUrl, String(discordUser.id)]
      )
      userRow = inserted.rows[0]
    }

    await createSession(event, sanitizeUser(userRow))
    return sendRedirect(event, `${BASE_URL}/`)
  } catch (error) {
    console.error('Discord auth error:', error)
    return sendRedirect(event, `${BASE_URL}/login?error=discord_auth_failed`)
  }
})
