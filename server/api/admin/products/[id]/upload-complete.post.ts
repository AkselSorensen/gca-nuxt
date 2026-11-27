// POST /api/admin/products/:id/upload-complete - { filename }
// Appelé après l'envoi direct vers R2 : vérifie que l'objet existe, remplace l'ancien fichier du produit.
import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { r2Streaming, DeleteObjectCommand, R2_BUCKET } from '../../../../services/r2'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (!r2Streaming) throw createError({ statusCode: 503, statusMessage: 'R2 non configuré' })
  const productId = Number(getRouterParam(event, 'id'))
  if (!productId) throw createError({ statusCode: 400, statusMessage: 'Produit invalide' })

  const body = await readBody(event)
  const filename = String(body?.filename || '').split(/[\\/]/).pop()!.replace(/[^\w.\- ()\[\]]+/g, '_').slice(0, 180)
  if (!filename) throw createError({ statusCode: 400, statusMessage: 'Nom de fichier requis' })
  const key = `products/${productId}/${filename}`

  let size = 0
  try {
    const head = await r2Streaming.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }))
    size = Number(head.ContentLength || 0)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Fichier introuvable sur R2 (envoi incomplet)' })
  }

  // Un produit n'a qu'un seul fichier : on supprime les anciens (sauf celui qu'on vient d'envoyer)
  const old = await query('SELECT storage_path FROM product_files WHERE product_id = $1', [productId])
  for (const f of old.rows as any[]) {
    if (f.storage_path === key) continue
    try { await r2Streaming.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: f.storage_path })) } catch { /* déjà absent */ }
  }
  await query('DELETE FROM product_files WHERE product_id = $1', [productId])
  const result = await query(
    `INSERT INTO product_files (product_id, filename, file_size, storage_path, is_main, sort_order)
     VALUES ($1, $2, $3, $4, TRUE, 0) RETURNING id`,
    [productId, filename, size, key]
  )
  console.log(`[admin] fichier produit ${productId} remplacé par ${filename} (${size} o, direct R2)`)
  return { ok: true, id: result.rows[0].id, key, size }
})
