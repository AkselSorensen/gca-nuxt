// POST /api/cart/items — ajouter un article au panier (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { getCart } from '../../services/cart'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)
  const productId = Number(body?.productId)
  const quantity = Math.max(1, Number(body?.quantity || 1))

  if (Number.isNaN(productId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid productId' })
  }

  try {
    // Empêche un vendeur d'ajouter ses propres produits au panier
    const prodResult = await query('SELECT seller_id FROM products WHERE id = $1', [productId])
    if (!prodResult.rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })
    }
    if (Number(prodResult.rows[0].seller_id) === Number(user.id)) {
      throw createError({ statusCode: 400, statusMessage: 'Vous ne pouvez pas acheter vos propres produits.' })
    }

    const cart = await getCart(user.id)
    await query(
      `
        INSERT INTO cart_items (cart_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (cart_id, product_id)
        DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
      `,
      [cart.id, productId, quantity]
    )
    return await getCart(user.id)
  } catch (error) {
    console.error('Add to cart error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to add item to cart' })
  }
})
