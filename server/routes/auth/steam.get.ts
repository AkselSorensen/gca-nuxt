// GET /auth/steam — redirection OpenID Steam (réplique du monolithe)
import { defineEventHandler, getQuery, sendRedirect } from 'h3'

const BASE_URL = process.env.APP_BASE_URL || 'https://gca-nuxt.vercel.app'
const STEAM_REALM = process.env.STEAM_REALM || BASE_URL
const STEAM_RETURN_URL = process.env.STEAM_RETURN_URL || `${BASE_URL}/auth/steam/callback`

export default defineEventHandler(async (event) => {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': STEAM_RETURN_URL,
    'openid.realm': STEAM_REALM,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })

  // Transmet return_url dans openid.return_to → le callback peut y revenir
  // (sinon Steam ne renvoie que l'URL nue → redirection par défaut au lieu du profil)
  const returnUrl = String(getQuery(event).return_url || '')
  if (returnUrl) {
    params.set('openid.return_to', `${STEAM_RETURN_URL}?return_url=${encodeURIComponent(returnUrl)}`)
  }

  return sendRedirect(event, `https://steamcommunity.com/openid/login?${params.toString()}`)
})
