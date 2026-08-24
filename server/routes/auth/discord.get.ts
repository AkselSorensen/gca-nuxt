// GET /auth/discord — redirection OAuth Discord (réplique du monolithe)
import { defineEventHandler, getQuery, sendRedirect } from 'h3'

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI

export default defineEventHandler(async (event) => {
  const scope = encodeURIComponent('identify email')
  const redirectUri = encodeURIComponent(DISCORD_REDIRECT_URI || '')
  const returnUrl = String(getQuery(event).return_url || '')
  const state = returnUrl ? Buffer.from(returnUrl).toString('base64') : ''
  const discordUrl =
    `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}` +
    `&response_type=code&redirect_uri=${redirectUri}&scope=${scope}` +
    (state ? `&state=${encodeURIComponent(state)}` : '')

  return sendRedirect(event, discordUrl)
})
