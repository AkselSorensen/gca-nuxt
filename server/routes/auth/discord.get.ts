// GET /auth/discord — redirection OAuth Discord (réplique du monolithe)
import { defineEventHandler, getQuery, sendRedirect } from 'h3'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI

export default defineEventHandler(async (event) => {
  // 'guilds' : vérification d'appartenance au serveur GSA (auth obligatoire)
  const scope = encodeURIComponent('identify email guilds')
  const redirectUri = encodeURIComponent(DISCORD_REDIRECT_URI || '')
  const returnUrl = String(getQuery(event).return_url || '')
  // state = base64(JSON) : { r: return_url, t: type de compte (buyer|seller), s: données vendeur }
  const payload = JSON.stringify({
    r: returnUrl,
    t: String(getQuery(event).account_type || 'buyer'),
    s: {
      shopName: String(getQuery(event).shop_name || ''),
      bio: String(getQuery(event).bio || ''),
      discordTag: String(getQuery(event).discord_tag || ''),
    },
  })
  const state = Buffer.from(payload).toString('base64')
  const discordUrl =
    `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
    `&response_type=code&redirect_uri=${redirectUri}&scope=${scope}` +
    `&state=${encodeURIComponent(state)}`

  return sendRedirect(event, discordUrl)
})
