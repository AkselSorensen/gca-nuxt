// PATCH /api/seller/profile — met à jour la description/boutique du vendeur connecté
import { defineEventHandler, readBody, createError } from 'h3'
import { query } from '../../services/db'
import { getSessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Non connecté' })
  if (user.role !== 'seller' && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Réservé aux vendeurs' })
  }

  const body = await readBody(event)
  const updates: string[] = []
  const params: any[] = []

  if (typeof body.bio === 'string') {
    params.push(String(body.bio).slice(0, 2000))
    updates.push(`seller_description = $${params.length}`)
  }
  if (typeof body.shopName === 'string') {
    params.push(String(body.shopName).slice(0, 120))
    updates.push(`shop_name = $${params.length}`)
  }
  if (typeof body.discord === 'string') {
    params.push(String(body.discord).slice(0, 120))
    updates.push(`discord_tag = $${params.length}`)
  }

  if (!updates.length) throw createError({ statusCode: 400, statusMessage: 'Aucun champ à mettre à jour' })

  params.push(user.id)
  await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`, params)

  const fresh = await query(
    'SELECT id, display_name, slug, seller_description, shop_name, discord_tag FROM users WHERE id = $1',
    [user.id]
  )
  const row = fresh.rows[0]
  return {
    ok: true,
    sellerDescription: row.seller_description || '',
    shopName: row.shop_name || '',
    discord: row.discord_tag || '',
  }
})
