// POST /api/admin/products/:id/upload — upload base64 vers R2 (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { r2Client, PutObjectCommand, DeleteObjectCommand, R2_BUCKET } from '../../../../services/r2'

// Un produit n'a QU'UN SEUL fichier : le nouvel upload REMPLACE l'ancien
// (l'acheteur télécharge toujours la dernière version).
async function clearProductFiles(productId: number) {
  const old = await query('SELECT storage_path FROM product_files WHERE product_id = $1', [productId])
  if (r2Client) {
    for (const f of old.rows as any[]) {
      try {
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: f.storage_path }))
      } catch { /* objet déjà absent */ }
    }
  }
  await query('DELETE FROM product_files WHERE product_id = $1', [productId])
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  if (!r2Client) throw createError({ statusCode: 503, statusMessage: 'R2 non configuré' })

  const productId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { filename, data_base64 } = body
  if (!filename || !data_base64) throw createError({ statusCode: 400, statusMessage: 'filename et data_base64 requis' })

  try {
    const buffer = Buffer.from(data_base64, 'base64')
    const key = `products/${productId}/${filename}`
    await clearProductFiles(productId)
    await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer }))
    const result = await query(
      `INSERT INTO product_files (product_id, filename, file_size, storage_path, is_main, sort_order)
       VALUES ($1, $2, $3, $4, TRUE, 0) RETURNING id`,
      [productId, filename, buffer.length, key]
    )
    console.log(`[admin] fichier produit ${productId} remplacé par ${filename} (${buffer.length} o)`)
    return { ok: true, id: result.rows[0].id, key, size: buffer.length }
  } catch (error: any) {
    console.error('Admin upload file error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to upload file' })
  }
})
