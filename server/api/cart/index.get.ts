// GET /api/cart — panier de l'utilisateur connecté (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { getCart } from '../../services/cart'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    return await getCart(user.id)
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Cart fetch error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch cart' })
  }
})
