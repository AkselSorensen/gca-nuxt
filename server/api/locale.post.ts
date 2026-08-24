// POST /api/locale — changer la langue de session (réplique du monolithe)
import { defineEventHandler, readBody } from 'h3'
import { query } from '../services/db'
import { getSessionId } from '../services/session'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const locale = body?.locale === 'en' ? 'en' : 'fr'
  const sid = getSessionId(event)
  if (sid) {
    try {
      const r = await query('SELECT sess FROM user_sessions WHERE sid = $1', [sid])
      if (r.rowCount) {
        const sess = r.rows[0].sess
        sess.locale = locale
        await query('UPDATE user_sessions SET sess = $1::json WHERE sid = $2', [JSON.stringify(sess), sid])
      }
    } catch { /* session non persistée : sans effet */ }
  }
  return { ok: true, locale }
})
