// PATCH /api/cart/items/:id — modifier la quantité (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireUser } from '../../../utils/auth'
import { getCart } from '../../../services/cart'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const cartItemId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const quantity = Number(body?.quantity)

  if (Number.isNaN(cartItemId) || Number.isNaN(quantity) || quantity < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid cart item update' })
  }

  try {
    const cart = await getCart(user.id)
    await query('UPDATE cart_items SET quantity = $1 WHERE id = $2 AND cart_id = $3', [quantity, cartItemId, cart.id])
    return await getCart(user.id)
  } catch (error) {
    console.error('Update cart item error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update cart item' })
  }
})
