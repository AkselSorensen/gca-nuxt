// DELETE /api/admin/products/:id/media/:mediaId — retirer une image (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../../utils/auth'
import { query } from '../../../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  const mediaId = Number(getRouterParam(event, 'mediaId'))
  if (Number.isNaN(productId) || Number.isNaN(mediaId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ids' })
  }

  try {
    await query('DELETE FROM product_media WHERE id = $1 AND product_id = $2', [mediaId, productId])
    return { ok: true }
  } catch (error: any) {
    console.error('Delete media error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to delete media' })
  }
})
