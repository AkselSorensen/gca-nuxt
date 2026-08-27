// GET /auth/discord/callback — retour OAuth Discord (réplique du monolithe)
// + vérification d'appartenance au serveur Discord GSA (auth obligatoire)
import { defineEventHandler, getQuery, sendRedirect } from 'h3'
import { query } from '../../../services/db'
import { hashPassword, slugify, sanitizeUser } from '../../../services/users'
import { createSession, updateSessionUser } from '../../../services/session'
import { getSessionUser } from '../../../utils/auth'

const BASE_URL = process.env.APP_BASE_URL || 'https://gca-nuxt.vercel.app'
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI
// Serveur 🛒 GSA Store — vérification d'appartenance
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '1364909003800580096'

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

    // 1) Profil Discord
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
    // Tag Discord affichable : username#discriminator (ou username seul sur les nouveaux comptes)
    const discordTag =
      discordUser.discriminator && String(discordUser.discriminator) !== '0'
        ? `${discordUser.username}#${discordUser.discriminator}`
        : discordUser.username

    // 2) Vérification : le compte Discord doit être membre du serveur GSA
    let isMember = false
    try {
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      if (guildsResponse.ok) {
        const guilds = await guildsResponse.json()
        isMember = Array.isArray(guilds) && guilds.some((g: any) => String(g.id) === DISCORD_GUILD_ID)
        console.log('[discord-callback] guilds:', guilds.length, '| membre de GSA Store:', isMember)
      } else {
        console.error('[discord-callback] guilds API status:', guildsResponse.status)
      }
    } catch (e) { console.error('[discord-callback] guilds fetch error:', e) }

    if (!isMember) {
      const state = String(getQuery(event).state || '')
      let returnUrl = ''
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'))
        returnUrl = decoded?.r || ''
      } catch { /* ignore */ }
      const sep = returnUrl ? '&return_url=' + encodeURIComponent(returnUrl) : ''
      // attempted=1 : l'utilisateur vient de tenter l'OAuth → le front affiche
      // un message clair ("vous n'avez pas encore rejoint le serveur")
      return sendRedirect(event, `${BASE_URL}/login?discord=required&attempted=1${sep}`)
    }

    // 3) Décodage du state : return_url + type de compte + données vendeur
    let returnUrl = ''
    let accountType = 'buyer'
    let sellerData: { shopName?: string; bio?: string; discordTag?: string } = {}
    try {
      const decoded = JSON.parse(Buffer.from(String(getQuery(event).state || ''), 'base64').toString('utf8'))
      returnUrl = decoded?.r || ''
      accountType = decoded?.t || 'buyer'
      sellerData = decoded?.s || {}
    } catch { /* state invalide → défauts */ }

    // 4) Si déjà connecté → mode liaison
    const sessionUser = await getSessionUser(event)
    if (sessionUser?.id) {
      await query(
        `UPDATE users SET discord_id = $1, avatar_url = COALESCE(NULLIF(avatar_url, ''), $2),
         discord_tag = COALESCE(NULLIF($4, ''), discord_tag) WHERE id = $3`,
        [String(discordUser.id), avatarUrl, sessionUser.id, discordTag]
      )
      const updated = await query('SELECT * FROM users WHERE id = $1', [sessionUser.id])
      await updateSessionUser(event, sanitizeUser(updated.rows[0]))
      let redirectAfterLink = `${BASE_URL}/profile`
      if (returnUrl && (returnUrl.startsWith('http') || returnUrl.startsWith('/'))) redirectAfterLink = returnUrl
      const sep = redirectAfterLink.includes('?') ? '&' : '?'
      redirectAfterLink += `${sep}discord_id=${discordUser.id}&discord_username=${discordUser.username}`
      return sendRedirect(event, redirectAfterLink)
    }

    // 5) Connexion ou création de compte (client ou vendeur)
    const existing = await query('SELECT * FROM users WHERE discord_id = $1 OR email = $2 LIMIT 1', [
      String(discordUser.id),
      email,
    ])
    let userRow: any

    if (existing.rowCount) {
      userRow = existing.rows[0]
      await query(
        `UPDATE users SET display_name = $2, avatar_url = $3, discord_id = $4,
         discord_tag = COALESCE(NULLIF($5, ''), discord_tag) WHERE id = $1`,
        [userRow.id, displayName, avatarUrl, String(discordUser.id), discordTag]
      )
      const updated = await query('SELECT * FROM users WHERE id = $1', [userRow.id])
      userRow = updated.rows[0]
    } else {
      const isSeller = accountType === 'seller'
      const slug = `${slugify(displayName)}-${discordUser.id}`
      if (isSeller) {
        const inserted = await query(
          `INSERT INTO users (email, password_hash, display_name, slug, role, avatar_url, discord_id, preferred_language,
                              seller_status, shop_name, seller_description, discord_tag)
           VALUES ($1, $2, $3, $4, 'customer', $5, $6, 'fr', 'pending', $7, $8, $9)
           RETURNING *`,
          [email, hashPassword(`discord-${discordUser.id}`), displayName, slug, avatarUrl, String(discordUser.id),
           sellerData.shopName || displayName, sellerData.bio || '', discordTag || sellerData.discordTag || '']
        )
        userRow = inserted.rows[0]
      } else {
        const inserted = await query(
          `INSERT INTO users (email, password_hash, display_name, slug, role, avatar_url, discord_id, preferred_language, discord_tag)
           VALUES ($1, $2, $3, $4, 'customer', $5, $6, 'fr', $7)
           RETURNING *`,
          [email, hashPassword(`discord-${discordUser.id}`), displayName, slug, avatarUrl, String(discordUser.id), discordTag]
        )
        userRow = inserted.rows[0]
      }
    }

    await createSession(event, sanitizeUser(userRow))
    console.log('[discord-callback] session créée pour user', userRow.id, '| seller_status:', userRow.seller_status || 'none')

    // Redirection intelligente : ne jamais renvoyer vers /login ou /register
    // (l'utilisateur est connecté — le renvoyer sur la page de login fait croire
    // que la connexion a échoué)
    const safeReturn = (u: string) => {
      const path = (u || '').split('?')[0]
      return u && (u.startsWith('http') || u.startsWith('/')) && path !== '/login' && path !== '/register' ? u : ''
    }
    if (userRow.seller_status === 'pending') {
      return sendRedirect(event, `${BASE_URL}/seller/pending`)
    }
    const target = safeReturn(returnUrl) || (userRow.role === 'seller' ? '/seller/account' : `${BASE_URL}/`)
    console.log('[discord-callback] redirect →', target)
    return sendRedirect(event, target)
  } catch (error) {
    console.error('Discord auth error:', error)
    return sendRedirect(event, `${BASE_URL}/login?error=discord_auth_failed`)
  }
})
