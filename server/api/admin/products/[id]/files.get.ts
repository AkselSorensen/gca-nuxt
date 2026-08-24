// GET /api/admin/products/:id/files — liste des fichiers (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  if (!productId) throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })

  try {
    const files = await query(
      `SELECT id, filename, file_size, storage_path, is_main, sort_order, created_at
       FROM product_files WHERE product_id = $1
       ORDER BY sort_order ASC, is_main DESC`,
      [productId]
    )
    return { items: files.rows }
  } catch (error: any) {
    console.error('Admin list files error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch files' })
  }
})
