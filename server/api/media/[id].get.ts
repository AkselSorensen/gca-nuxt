// GET /api/media/:id[?w=480] - sert une image produit :
//  1. stockée en R2 (storage_path) → lue depuis R2
//  2. sinon base64 en DB
//  3. URL externe → redirection
// Performances :
//  - ?w=<largeur> redimensionne (sharp) et renvoie du WebP si le navigateur l'accepte
//  - cache navigateur 1 an (immutable) : un média n'est jamais modifié, un nouvel envoi crée un nouvel id
//  - ETag + 304, et petit cache mémoire pour ne pas relire R2 / recalculer les miniatures
import { defineEventHandler, getRouterParam, getQuery, getRequestHeader, createError, setResponseHeader, setResponseStatus, sendRedirect } from 'h3'
import { createHash } from 'node:crypto'
import { query } from '../../services/db'
import { r2Client, GetObjectCommand, PutObjectCommand, R2_BUCKET } from '../../services/r2'

const ALLOWED_WIDTHS = [160, 320, 480, 640, 1280]
const CACHE_MAX_BYTES = 64 * 1024 * 1024
type Entry = { buf: Buffer; type: string; etag: string }
const cache = new Map<string, Entry>()
let cacheBytes = 0

function remember(key: string, e: Entry) {
  if (e.buf.length > 4 * 1024 * 1024) return
  const old = cache.get(key)
  if (old) { cacheBytes -= old.buf.length; cache.delete(key) }
  cache.set(key, e)
  cacheBytes += e.buf.length
  for (const k of cache.keys()) {
    if (cacheBytes <= CACHE_MAX_BYTES) break
    const v = cache.get(k)!
    cacheBytes -= v.buf.length
    cache.delete(k)
  }
}

function snapWidth(raw: unknown): number {
  const n = Number(raw)
  if (!Number.isFinite(n) || n <= 0) return 0
  return ALLOWED_WIDTHS.find((w) => w >= n) || ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1]
}

let sharpMod: any = undefined
async function getSharp() {
  if (sharpMod !== undefined) return sharpMod
  try { sharpMod = (await import('sharp')).default } catch { sharpMod = null }
  return sharpMod
}

function send(event: any, e: Entry) {
  setResponseHeader(event, 'Content-Type', e.type)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  setResponseHeader(event, 'ETag', e.etag)
  setResponseHeader(event, 'Vary', 'Accept')
  if (getRequestHeader(event, 'if-none-match') === e.etag) {
    setResponseStatus(event, 304)
    return ''
  }
  setResponseHeader(event, 'Content-Length', String(e.buf.length))
  return e.buf
}

export default defineEventHandler(async (event) => {
  const mediaId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(mediaId)) throw createError({ statusCode: 400, statusMessage: 'Invalid media id' })

  const width = snapWidth(getQuery(event).w)
  const wantsWebp = /image\/webp/.test(String(getRequestHeader(event, 'accept') || ''))
  const variant = width ? `${mediaId}:${width}:${wantsWebp ? 'w' : 'j'}` : `${mediaId}:orig`

  const hit = cache.get(variant)
  if (hit) return send(event, hit)

  const result = await query('SELECT url, media_type, storage_path FROM product_media WHERE id = $1', [mediaId])
  if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

  const row = result.rows[0]
  const url = String(row.url || '')
  let buffer: Buffer | null = null
  let mime = row.media_type === 'video' ? 'video/mp4' : 'image/jpeg'

  // Miniature WebP déjà générée et stockée sur R2 : servie telle quelle (calculée une seule fois, survit aux redémarrages)
  const variantKey = row.storage_path && width && wantsWebp && row.media_type !== 'video' ? `${row.storage_path}.w${width}.webp` : ''
  if (variantKey && r2Client) {
    try {
      const v = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: variantKey }))
      const vb = Buffer.from(await v.Body!.transformToByteArray())
      const ve: Entry = { buf: vb, type: 'image/webp', etag: '"' + createHash('sha1').update(variant).update(String(vb.length)).digest('hex').slice(0, 20) + '"' }
      remember(variant, ve)
      return send(event, ve)
    } catch { /* pas encore générée : on la crée ci-dessous */ }
  }

  if (row.storage_path) {
    if (!r2Client) throw createError({ statusCode: 503, statusMessage: 'R2 non configuré' })
    try {
      const obj = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: row.storage_path }))
      buffer = Buffer.from(await obj.Body!.transformToByteArray())
      if (obj.ContentType && /^(image|video)\//.test(obj.ContentType)) mime = obj.ContentType
    } catch (error: any) {
      console.error('[media] R2 fetch error:', error?.message)
      throw createError({ statusCode: 404, statusMessage: 'Media not found' })
    }
  } else if (/^https?:\/\//i.test(url)) {
    return sendRedirect(event, url)
  } else {
    const match = url.match(/^data:([^;,]+);base64,(.*)$/s)
    if (!match) throw createError({ statusCode: 404, statusMessage: 'Unsupported media' })
    mime = match[1]
    buffer = Buffer.from(match[2], 'base64')
  }

  let out = buffer!
  let type = mime
  if (width && mime.startsWith('image/') && mime !== 'image/gif' && mime !== 'image/svg+xml') {
    const sharp = await getSharp()
    if (sharp) {
      try {
        const img = sharp(buffer, { failOn: 'none' }).rotate().resize({ width, withoutEnlargement: true })
        if (wantsWebp) { out = await img.webp({ quality: 78 }).toBuffer(); type = 'image/webp' }
        else { out = await img.jpeg({ quality: 80, mozjpeg: true }).toBuffer(); type = 'image/jpeg' }
      } catch (error: any) {
        console.error('[media] resize error:', error?.message)
        out = buffer!; type = mime
      }
    }
  }

  // Sauvegarde la miniature WebP sur R2 pour ne plus jamais la recalculer
  if (variantKey && r2Client && type === 'image/webp' && out !== buffer) {
    r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: variantKey, Body: out, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }))
      .catch((e: any) => console.warn('[media] sauvegarde miniature impossible:', e?.message))
  }

  const entry: Entry = { buf: out, type, etag: '"' + createHash('sha1').update(variant).update(String(out.length)).digest('hex').slice(0, 20) + '"' }
  remember(variant, entry)
  return send(event, entry)
})
