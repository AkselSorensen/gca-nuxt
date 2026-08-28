// POST /api/admin/products/:id/files — enregistrer un fichier (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { filename, file_size, storage_path, is_main, sort_order } = body
  if (!filename || !storage_path) {
    throw createError({ statusCode: 400, statusMessage: 'filename et storage_path requis' })
  }

  try {
    // Remplacement : un seul fichier par produit (le nouveau prend le dessus)
    await query('DELETE FROM product_files WHERE product_id = $1', [productId])
    const result = await query(
      `INSERT INTO product_files (product_id, filename, file_size, storage_path, is_main, sort_order)
       VALUES ($1, $2, $3, $4, TRUE, 0) RETURNING id`,
      [productId, filename, file_size || 0, storage_path]
    )
    return { ok: true, id: result.rows[0].id }
  } catch (error: any) {
    console.error('Admin register file error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to register file' })
  }
})
