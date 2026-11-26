// POST /api/admin/products/:id/upload-stream?filename=... - upload du fichier produit (corps binaire)
// Le fichier est envoyé tel quel (pas de base64) et transmis à R2 en flux : la mémoire du serveur
// reste faible même pour un gros fichier (l'ancien envoi en base64 pouvait faire tomber l'application : 502).
import { defineEventHandler, getRouterParam, getQuery, getRequestHeader, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { r2Streaming, PutObjectCommand, DeleteObjectCommand, R2_BUCKET } from '../../../../services/r2'

const MAX_BYTES = 2 * 1024 * 1024 * 1024 // 2 Go

// Un produit n'a QU'UN SEUL fichier : le nouvel upload REMPLACE l'ancien
async function clearProductFiles(productId: number) {
  const old = await query('SELECT storage_path FROM product_files WHERE product_id = $1', [productId])
  if (r2Streaming) {
    for (const f of old.rows as any[]) {
      try {
        await r2Streaming.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: f.storage_path }))
      } catch { /* objet déjà absent */ }
    }
  }
  await query('DELETE FROM product_files WHERE product_id = $1', [productId])
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (!r2Streaming) throw createError({ statusCode: 503, statusMessage: 'R2 non configuré' })

  const productId = Number(getRouterParam(event, 'id'))
  if (!productId) throw createError({ statusCode: 400, statusMessage: 'Produit invalide' })

  // nom de fichier sans chemin ni caractères dangereux
  const rawName = String(getQuery(event).filename || '')
  const filename = rawName.split(/[\\/]/).pop()!.replace(/[^\w.\- ()\[\]]+/g, '_').slice(0, 180)
  if (!filename) throw createError({ statusCode: 400, statusMessage: 'Nom de fichier requis' })

  const length = Number(getRequestHeader(event, 'content-length'))
  if (!length || length < 1) throw createError({ statusCode: 411, statusMessage: 'Taille du fichier manquante' })
  if (length > MAX_BYTES) throw createError({ statusCode: 413, statusMessage: 'Fichier trop volumineux (2 Go maximum)' })

  try {
    const key = `products/${productId}/${filename}`
    await clearProductFiles(productId)
    await r2Streaming.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: event.node.req,
      ContentLength: length,
      ContentType: String(getRequestHeader(event, 'x-file-type') || 'application/octet-stream'),
    }))
    const result = await query(
      `INSERT INTO product_files (product_id, filename, file_size, storage_path, is_main, sort_order)
       VALUES ($1, $2, $3, $4, TRUE, 0) RETURNING id`,
      [productId, filename, length, key]
    )
    console.log(`[admin] fichier produit ${productId} remplacé par ${filename} (${length} o, flux)`)
    return { ok: true, id: result.rows[0].id, key, size: length }
  } catch (error: any) {
    console.error('Admin upload stream error:', error?.message || error)
    throw createError({ statusCode: 500, statusMessage: 'Impossible d\'envoyer le fichier' })
  }
})
