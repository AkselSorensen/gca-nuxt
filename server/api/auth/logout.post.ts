// POST /api/auth/logout — déconnexion (détruit la session + efface le cookie)
import { defineEventHandler } from 'h3'
import { destroySession } from '../../services/session'

export default defineEventHandler(async (event) => {
  await destroySession(event)
  return { ok: true }
})
