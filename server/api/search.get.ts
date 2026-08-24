// GET /api/search?q= — recherche produits (réplique du monolithe Express)
import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import { query } from '../services/db'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=300')
  try {
    const search = String(getQuery(event).q || '').trim()
    if (!search) return { items: [] }

    const result = await query(
      `
        SELECT
          p.slug,
          p.title,
          p.price,
          p.rating,
          p.review_count,
          c.name AS category_name,
          COALESCE(
            (
              SELECT pm.thumbnail_url
              FROM product_media pm
              WHERE pm.product_id = p.id
              ORDER BY pm.sort_order ASC, pm.id ASC
              LIMIT 1
            ),
            ''
          ) AS thumbnail
        FROM products p
        JOIN categories c ON c.id = p.category_id
        WHERE p.title ILIKE $1
           OR p.short_description ILIKE $1
           OR p.description ILIKE $1
           OR array_to_string(p.tags, ' ') ILIKE $1
        ORDER BY p.popularity_score DESC, p.views DESC
        LIMIT 8
      `,
      [`%${search}%`]
    )

    return { items: result.rows }
  } catch (error) {
    console.error('Search error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to search products' })
  }
})
