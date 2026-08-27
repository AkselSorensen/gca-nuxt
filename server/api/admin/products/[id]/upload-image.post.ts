// POST /api/admin/products/:id/upload-image — upload image → R2
// (remplace le stockage base64 en DB : les images vivent dans R2)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { uploadImageToR2 } from '../../../../services/r2'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { data_base64, mime } = body
  if (!data_base64) throw createError({ statusCode: 400, statusMessage: 'data_base64 requis' })

  try {
    const base64Length = Buffer.from(String(data_base64), 'base64').length
    if (base64Length > 8 * 1024 * 1024) {
      throw createError({ statusCode: 400, statusMessage: 'Image trop lourde (max 8 Mo)' })
    }
    const res = await uploadImageToR2(productId, `data:${mime || 'image/jpeg'};base64,${data_base64}`, mime || 'image/jpeg')
    return { ok: true, id: res.mediaId, url: res.url, size: res.size }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin upload image error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to upload image' })
  }
})
