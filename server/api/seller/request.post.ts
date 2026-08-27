// POST /api/seller/request — un client demande à devenir vendeur
import { defineEventHandler, readBody, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody(event)

  // Déjà vendeur ou déjà en attente ?
  const current = await query(
    'SELECT role, seller_status FROM users WHERE id = $1',
    [user.id]
  )
  const role = current.rows[0]?.role
  const sellerStatus = current.rows[0]?.seller_status

  if (role === 'seller' || role === 'admin') {
    throw createError({ statusCode: 400, statusMessage: 'Votre compte est déjà vendeur.' })
  }
  if (sellerStatus === 'pending') {
    throw createError({ statusCode: 400, statusMessage: 'Votre demande est déjà en attente de validation.' })
  }

  const shopName = String(body?.shopName || '').trim().slice(0, 60)
  const sellerDescription = String(body?.bio || '').trim().slice(0, 500)
  const discordTag = String(body?.discordTag || '').trim().slice(0, 40)

  if (!shopName) {
    throw createError({ statusCode: 400, statusMessage: 'Le nom de la boutique est requis.' })
  }
  if (!sellerDescription) {
    throw createError({ statusCode: 400, statusMessage: 'La description de votre activité est requise.' })
  }
  if (!discordTag) {
    throw createError({ statusCode: 400, statusMessage: 'Votre tag Discord est requis.' })
  }

  await query(
    `UPDATE users
     SET seller_status = 'pending', shop_name = $1, seller_description = $2, discord_tag = $3
     WHERE id = $4`,
    [shopName, sellerDescription, discordTag, user.id]
  )

  return { ok: true, sellerPending: true, message: 'Demande envoyée !' }
})
