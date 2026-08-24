// GET /api/products/:slug — détail + owned (réplique du monolithe Express)
// Cache PRIVÉ 30s (jamais de cache CDN partagé : le flag owned est par utilisateur)
import { defineEventHandler, getRouterParam, createError, setResponseHeader } from 'h3'
import { query } from '../../services/db'
import { getProductBySlug } from '../../services/products'
import { getSessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, max-age=30')
  try {
    const slug = getRouterParam(event, 'slug') || ''
    const sessionUser = await getSessionUser(event)
    const product = await getProductBySlug(slug, sessionUser?.id || null)

    if (!product) {
      throw createError({ statusCode: 404, statusMessage: 'Product not found' })
    }

    await query('UPDATE products SET views = views + 1, updated_at = NOW() WHERE id = $1', [product.id])
    product.views += 1

    // Indique si l'utilisateur connecté possède déjà ce produit (pour éviter le rachat)
    let owned = false
    if (sessionUser?.id) {
      const ownedResult = await query(
        `SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = $1 AND o.user_id = $2 AND o.status = 'completed' LIMIT 1`,
        [product.id, sessionUser.id]
      )
      owned = ownedResult.rowCount > 0
    }

    return { ...product, owned }
  } catch (error: any) {
    if (error?.statusCode === 404) throw error
    console.error('Product detail error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch product' })
  }
})
