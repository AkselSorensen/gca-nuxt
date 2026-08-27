// DELETE /api/admin/products/:id — suppression (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'
import { purgeRouteCache } from '../../../utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(productId)) throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })

  try {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [productId])
    if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    await purgeRouteCache()
    return { ok: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin delete product error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to delete admin product' })
  }
})
