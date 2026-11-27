// POST /api/admin/products/:id/upload-init - { filename, type, size }
// Renvoie une URL signée : le navigateur envoie le fichier DIRECTEMENT sur R2 (sans passer par Cloudflare ni le VPS),
// puis appelle upload-complete pour l'enregistrer.
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { requireAdmin } from '../../../../utils/auth'
import { r2Streaming, PutObjectCommand, R2_BUCKET } from '../../../../services/r2'

const MAX_BYTES = 5 * 1024 * 1024 * 1024 // limite d'un envoi simple vers R2

function safeFilename(raw: unknown) {
  return String(raw || '').split(/[\\/]/).pop()!.replace(/[^\w.\- ()\[\]]+/g, '_').slice(0, 180)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (!r2Streaming) throw createError({ statusCode: 503, statusMessage: 'R2 non configuré' })
  const productId = Number(getRouterParam(event, 'id'))
  if (!productId) throw createError({ statusCode: 400, statusMessage: 'Produit invalide' })

  const body = await readBody(event)
  const filename = safeFilename(body?.filename)
  if (!filename) throw createError({ statusCode: 400, statusMessage: 'Nom de fichier requis' })
  const size = Number(body?.size)
  if (!size || size < 1) throw createError({ statusCode: 400, statusMessage: 'Taille du fichier manquante' })
  if (size > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux (5 Go maximum)' })

  const contentType = String(body?.type || 'application/octet-stream')
  const key = `products/${productId}/${filename}`
  const url = await getSignedUrl(
    r2Streaming,
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: 3 * 3600 }
  )
  return { url, key, filename, contentType }
})
