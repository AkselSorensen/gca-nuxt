// GET /api/admin/products — liste admin des produits (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const result = await query(
      `
        SELECT
          p.id,
          p.title,
          p.slug,
          p.short_description,
          p.description,
          p.installation,
          p.price,
          p.old_price,
          p.discount_percent,
          p.category_id,
          c.slug AS category_slug,
          c.name AS category,
          p.seller_id,
          u.slug AS seller_slug,
          u.display_name AS seller_name,
          p.tags,
          p.is_featured,
          p.is_trending,
          p.is_new,
          p.is_hidden,
          p.created_at,
          COALESCE((SELECT pm2.thumbnail_url FROM product_media pm2 WHERE pm2.product_id = p.id ORDER BY pm2.sort_order ASC, pm2.id ASC LIMIT 1), '') AS thumbnail,
          COALESCE((SELECT SUM(oi.quantity) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = p.id AND o.status = 'completed'), 0)::int AS sales,
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
        GROUP BY p.id, c.slug, c.name, u.slug, u.display_name
        ORDER BY p.created_at DESC, p.id DESC
      `
    )
    return result.rows.map((r: any) => ({
      ...r,
      thumbnail: r.thumbnail && String(r.thumbnail).startsWith('data:')
        ? (r.media?.[0]?.id ? `/api/media/${r.media[0].id}` : r.thumbnail)
        : r.thumbnail,
      media: (r.media || []).map((m: any) => ({
        ...m,
        url: m.url && String(m.url).startsWith('data:') ? `/api/media/${m.id}` : m.url,
        thumbnail: m.thumbnail && String(m.thumbnail).startsWith('data:') ? `/api/media/${m.id}` : m.thumbnail,
      })),
    }))
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin products error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch admin products' })
  }
})
