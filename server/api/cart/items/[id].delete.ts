// DELETE /api/cart/items/:id — retirer un article (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireUser } from '../../../utils/auth'
import { getCart } from '../../../services/cart'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const cartItemId = Number(getRouterParam(event, 'id'))

  if (Number.isNaN(cartItemId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid cart item id' })
  }

  try {
    const cart = await getCart(user.id)
    await query('DELETE FROM cart_items WHERE id = $1 AND cart_id = $2', [cartItemId, cart.id])
    return await getCart(user.id)
  } catch (error) {
    console.error('Delete cart item error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to delete cart item' })
  }
})
