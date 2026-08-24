// GET /api/media/:id — sert une image stockée en base64 en DB
// (évite d'embarquer des Mo de base64 dans les réponses produits).
// Cache navigateur 7 jours : les images ne sont chargées qu'une fois.
import { defineEventHandler, getRouterParam, createError, setResponseHeader, sendRedirect } from 'h3'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  const mediaId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(mediaId)) throw createError({ statusCode: 400, statusMessage: 'Invalid media id' })

  const result = await query('SELECT url, media_type FROM product_media WHERE id = $1', [mediaId])
  if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

  const url = String(result.rows[0].url || '')

  // URL externe → redirection (le navigateur charge la ressource distante)
  if (/^https?:\/\//i.test(url)) {
    return sendRedirect(event, url)
  }

  // Base64 data URL → stream du buffer
  const match = url.match(/^data:([^;,]+);base64,(.*)$/s)
  if (!match) throw createError({ statusCode: 404, statusMessage: 'Unsupported media' })

  const mime = match[1]
  const buffer = Buffer.from(match[2], 'base64')

  setResponseHeader(event, 'Content-Type', mime)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=604800, immutable')
  setResponseHeader(event, 'Content-Length', String(buffer.length))

  return buffer
})
