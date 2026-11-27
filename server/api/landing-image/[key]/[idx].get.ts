// GET /api/landing-image/:key/:idx - image d'un élément de la page d'accueil (collaborateurs / communautés).
// Elles sont stockées en base64 dans la config : on les sort de /api/bootstrap (180 Ko de JSON)
// pour les servir comme de vraies images, mises en cache par le navigateur.
import { defineEventHandler, getRouterParam, setResponseHeader, createError } from 'h3'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  const key = String(getRouterParam(event, 'key') || '')
  const idx = Number(getRouterParam(event, 'idx'))
  if (!key || !Number.isInteger(idx) || idx < 0) throw createError({ statusCode: 400, statusMessage: 'Bad request' })

  const r = await query('SELECT metadata FROM admin_landing_config WHERE section_key = $1', [key])
  const image = String(r.rows[0]?.metadata?.items?.[idx]?.image || '')
  const m = image.match(/^data:([^;,]+);base64,(.*)$/s)
  if (!m) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const buf = Buffer.from(m[2], 'base64')
  setResponseHeader(event, 'Content-Type', m[1])
  // L'URL contient ?v=<taille> : elle change dès que l'image change, donc cache long sans risque
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'Content-Length', String(buf.length))
  return buf
})
