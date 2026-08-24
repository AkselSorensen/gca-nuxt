// POST /api/admin/products/:id/media — ajouter une image (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const url = String(body?.url || '').trim()
  if (Number.isNaN(productId) || !url) throw createError({ statusCode: 400, statusMessage: 'url required' })

  try {
    const sortRes = await query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM product_media WHERE product_id = $1',
      [productId]
    )
    const next = Number(sortRes.rows[0].next)
    const r = await query(
      `INSERT INTO product_media (product_id, media_type, url, thumbnail_url, sort_order) VALUES ($1, 'image', $2, $2, $3) RETURNING id`,
      [productId, url, next]
    )
    return { ok: true, id: r.rows[0].id }
  } catch (error: any) {
    console.error('Add media error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to add media' })
  }
})
