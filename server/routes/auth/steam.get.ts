// GET /auth/steam — redirection OpenID Steam (réplique du monolithe)
import { defineEventHandler, sendRedirect } from 'h3'

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
  return sendRedirect(event, `https://steamcommunity.com/openid/login?${params.toString()}`)
})
