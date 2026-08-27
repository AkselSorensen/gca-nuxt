// POST /api/admin/products — création (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'
import { slugify } from '../../../services/users'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const {
    title,
    shortDescription,
    description,
    installation,
    categorySlug,
    sellerSlug,
    price,
    discountPercent,
    isHidden,
    tags,
    thumbnail,
    platform,
    videoUrl,
  } = await readBody(event)

  if (!title || !shortDescription || !description || !installation || !categorySlug || !sellerSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required product fields' })
  }

  try {
    const category = await query('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [categorySlug])
    const seller = await query('SELECT id FROM users WHERE slug = $1 OR email = $1 LIMIT 1', [sellerSlug])

    if (!category.rowCount || !seller.rowCount) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid category or seller' })
    }

    const inserted = await query(
      `
        INSERT INTO products (
          seller_id,
          category_id,
          category,
          name,
          title,
          slug,
          short_description,
          description,
          installation,
          price,
          old_price,
          platform,
          video_url,
          discount_percent,
          tags,
          is_new,
          is_hidden,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, TRUE, $15, $16, NOW(), NOW())
        RETURNING id, slug
      `,
      [
        seller.rows[0].id,
        category.rows[0].id,
        categorySlug,
        String(title).trim(),
        String(title).trim(),
        `${slugify(title)}-${Date.now()}`,
        String(shortDescription).trim(),
        String(description).trim(),
        String(installation).trim(),
        Number(discountPercent || 0) > 0 ? Number(price || 0) * (1 - Number(discountPercent || 0) / 100) : Number(price || 0),
        Number(price || 0),
        platform || "Garry's Mod",
        videoUrl || null,
        Number(discountPercent || 0),
        Array.isArray(tags) ? tags : [],
        !!isHidden,
      ]
    )

    if (thumbnail) {
      await query(
        `INSERT INTO product_media (product_id, media_type, url, thumbnail_url, sort_order)
         VALUES ($1, 'image', $2, $2, 0)`,
        [inserted.rows[0].id, String(thumbnail)]
      )
    }

    return inserted.rows[0]
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin create product error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to create admin product' })
  }
})
