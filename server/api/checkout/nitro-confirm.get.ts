// Route legacy : le backend Express monté via server/routes/[...].ts gère
// maintenant /api/checkout/confirm-session directement. Ce fichier est un
// reliquat de l'époque où le backend était sur un autre domaine.
import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return {
    ok: true,
    migrated: true,
    message: 'Le backend est maintenant intégré dans gsa-nuxt',
    sessionId: query.session_id || null,
  }
})
