// PATCH /api/admin/products/:id — modification (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const productId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(productId)) throw createError({ statusCode: 400, statusMessage: 'Invalid product id' })

  const {
    title, price, discountPercent, isFeatured, isTrending, isNew,
    shortDescription, description, installation, categorySlug, sellerSlug, tags, isHidden,
    thumbnail, platform, videoUrl,
  } = await readBody(event)

  try {
    let categoryId: number | null = null
    let categoryName: string | null = null
    if (categorySlug) {
      const catResult = await query('SELECT id, name FROM categories WHERE slug = $1 LIMIT 1', [categorySlug])
      if (catResult.rowCount) {
        categoryId = catResult.rows[0].id
        categoryName = catResult.rows[0].name
      }
    }

    let sellerId: number | null = null
    if (sellerSlug) {
      const sellerResult = await query('SELECT id FROM users WHERE slug = $1 OR email = $1 LIMIT 1', [sellerSlug])
      if (!sellerResult.rowCount) throw createError({ statusCode: 400, statusMessage: 'Invalid seller' })
      sellerId = sellerResult.rows[0].id
    }

    const updates: string[] = []
    const values: any[] = []
    let idx = 1
    if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(String(title).trim()) }
    if (shortDescription !== undefined) { updates.push(`short_description = $${idx++}`); values.push(String(shortDescription).trim()) }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(String(description).trim()) }
    if (installation !== undefined) { updates.push(`installation = $${idx++}`); values.push(String(installation).trim()) }
    if (categoryId !== null) {
      updates.push(`category_id = $${idx++}`); values.push(categoryId)
      updates.push(`category = $${idx++}`); values.push(categoryName)
    }
    if (price !== undefined && discountPercent !== undefined) {
      const basePrice = Number(price)
      const discount = Number(discountPercent)
      const newPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice
      updates.push(`old_price = $${idx++}`); values.push(basePrice)
      updates.push(`price = $${idx++}`); values.push(newPrice)
      updates.push(`discount_percent = $${idx++}`); values.push(discount)
    } else if (price !== undefined) {
      updates.push(`old_price = $${idx++}`); values.push(Number(price))
      updates.push(`price = $${idx++}`); values.push(Number(price))
    } else if (discountPercent !== undefined) {
      const currentProductResult = await query('SELECT old_price, price FROM products WHERE id = $1', [productId])
      if (currentProductResult.rowCount > 0) {
        const currentProduct = currentProductResult.rows[0]
        const basePrice = Number(currentProduct.old_price) > 0 ? Number(currentProduct.old_price) : Number(currentProduct.price)
        const discount = Number(discountPercent)
        const newPrice = discount > 0 ? basePrice * (1 - discount / 100) : basePrice
        updates.push(`old_price = $${idx++}`); values.push(basePrice)
        updates.push(`price = $${idx++}`); values.push(newPrice)
        updates.push(`discount_percent = $${idx++}`); values.push(discount)
      }
    }
    if (tags !== undefined) { updates.push(`tags = $${idx++}`); values.push(Array.isArray(tags) ? tags : []) }
    if (platform !== undefined && platform !== null) { updates.push(`platform = $${idx++}`); values.push(String(platform).trim()) }
    if (videoUrl !== undefined) { updates.push(`video_url = $${idx++}`); values.push(videoUrl ? String(videoUrl).trim() : null) }
    if (isFeatured !== undefined) { updates.push(`is_featured = $${idx++}`); values.push(Boolean(isFeatured)) }
    if (isTrending !== undefined) { updates.push(`is_trending = $${idx++}`); values.push(Boolean(isTrending)) }
    if (isNew !== undefined) { updates.push(`is_new = $${idx++}`); values.push(Boolean(isNew)) }
    if (isHidden !== undefined) { updates.push(`is_hidden = $${idx++}`); values.push(Boolean(isHidden)) }
    if (sellerId !== null) { updates.push(`seller_id = $${idx++}`); values.push(sellerId) }

    if (!updates.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

    values.push(productId)
    const result = await query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, title, slug, price, discount_percent`,
      values
    )
    if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'Product not found' })

    if (thumbnail) {
      await query('DELETE FROM product_media WHERE product_id = $1 AND sort_order = 0', [productId])
      await query(
        `INSERT INTO product_media (product_id, media_type, url, thumbnail_url, sort_order)
         VALUES ($1, 'image', $2, $2, 0)`,
        [productId, String(thumbnail)]
      )
    }

    return { ok: true, product: result.rows[0] }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin product update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update product' })
  }
})
