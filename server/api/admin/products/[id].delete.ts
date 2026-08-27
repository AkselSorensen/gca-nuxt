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
    // Suppression DOUCE : un produit avec des ventes ne peut pas être détruit
    // (FK order_items.product_id → historique des commandes + factures).
    // On le masque du catalogue ; son titre n'est PAS modifié (il disparaît de
    // la liste active et l'historique des commandes garde le vrai nom).
    const result = await query(
      `UPDATE products
       SET is_hidden = TRUE
       WHERE id = $1
       RETURNING id, title, is_hidden`,
      [productId]
    )
    if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    await purgeRouteCache()
    return { ok: true, soft: true, product: result.rows[0] }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin delete product error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to delete product' })
  }
})
