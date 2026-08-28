// GET /api/media/:id — sert une image produit :
//  1. stockée en R2 (storage_path) → stream depuis R2 (Cloudflare)
//  2. sinon base64 en DB → stream du buffer
//  3. URL externe → redirection
// Cache navigateur 7 jours : les images ne sont chargées qu'une fois.
import { defineEventHandler, getRouterParam, createError, setResponseHeader, sendRedirect } from 'h3'
import { query } from '../../services/db'
import { r2Client, GetObjectCommand, R2_BUCKET } from '../../services/r2'

export default defineEventHandler(async (event) => {
  const mediaId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(mediaId)) throw createError({ statusCode: 400, statusMessage: 'Invalid media id' })

  const result = await query('SELECT url, media_type, storage_path FROM product_media WHERE id = $1', [mediaId])
  if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

  const row = result.rows[0]
  const url = String(row.url || '')

  // 1) Image stockée en R2 → stream (cache CDN + navigateur)
  if (row.storage_path) {
    if (!r2Client) throw createError({ statusCode: 503, statusMessage: 'R2 non configuré' })
    try {
      const obj = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: row.storage_path }))
      const buffer = Buffer.from(await obj.Body!.transformToByteArray())
      const mime = row.media_type === 'video' ? 'video/mp4' : (row.media_type || 'image/jpeg')
      setResponseHeader(event, 'Content-Type', mime)
      setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
      setResponseHeader(event, 'Content-Length', String(buffer.length))
      return buffer
    } catch (error: any) {
      console.error('[media] R2 fetch error:', error?.message)
      throw createError({ statusCode: 404, statusMessage: 'Media not found' })
    }
  }

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
  setResponseHeader(event, 'Cache-Control', 'public, max-age=300')
  setResponseHeader(event, 'Content-Length', String(buffer.length))

  return buffer
})
