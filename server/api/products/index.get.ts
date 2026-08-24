// GET /api/products — liste avec filtres + tri (réplique du monolithe Express)
// Cache navigateur 60s + CDN 5min : données publiques, pas d'utilisateur.
import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import { query } from '../../services/db'
import { buildWhereClause, mapProduct } from '../../services/products'

const CACHE_PUBLIC = 'public, max-age=60, s-maxage=300, stale-while-revalidate=300'

const allowedSorts: Record<string, string> = {
  popular: 'p.popularity_score DESC, p.views DESC',
  new: 'p.created_at DESC',
  discount: 'p.discount_percent DESC, p.views DESC',
  rating: 'p.rating DESC, p.review_count DESC',
  price_asc: 'p.price ASC',
  price_desc: 'p.price DESC',
}

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', CACHE_PUBLIC)
  try {
    const q = getQuery(event)
    const sortMode = String(q.sort || 'popular')
    const orderBy = allowedSorts[sortMode] || allowedSorts.popular
    const where = buildWhereClause(q)

    const result = await query(
      `
        SELECT
          p.id,
          p.slug,
          p.title,
          p.short_description,
          p.description,
          p.installation,
          p.price,
          p.old_price,
          p.platform,
          p.discount_percent,
          p.rating,
          p.review_count,
          p.views,
          p.tags,
          p.is_trending,
          p.is_featured,
          p.is_new,
          p.is_hidden,
          p.popularity_score,
          p.created_at,
          p.updated_at,
          c.name AS category_name,
          c.slug AS category_slug,
          u.display_name AS seller_name,
          u.slug AS seller_slug,
          u.avatar_url AS seller_avatar,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pm.id,
                'type', pm.media_type,
                'url', pm.url,
                'thumbnail', pm.thumbnail_url,
                'sortOrder', pm.sort_order
              )
              ORDER BY pm.sort_order ASC, pm.id ASC
            ) FILTER (WHERE pm.id IS NOT NULL),
            '[]'::json
          ) AS media
        FROM products p
        JOIN categories c ON c.id = p.category_id
        JOIN users u ON u.id = p.seller_id
        LEFT JOIN product_media pm ON pm.product_id = p.id
        ${where.sql}
        GROUP BY p.id, c.name, c.slug, u.display_name, u.slug, u.avatar_url
        ORDER BY ${orderBy}
      `,
      where.values
    )

    return {
      items: result.rows.map(mapProduct),
      total: result.rowCount,
    }
  } catch (error) {
    console.error('Products list error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch products' })
  }
})
