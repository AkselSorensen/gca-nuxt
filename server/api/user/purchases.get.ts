// GET /api/user/purchases — produits achetés (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    const result = await query(
      `
        SELECT
          oi.id AS order_item_id,
          oi.product_id,
          oi.price,
          oi.download_count,
          o.created_at AS purchase_date,
          p.slug,
          p.title,
          p.rating,
          p.review_count,
          c.name AS category_name,
          (
            SELECT json_agg(json_build_object(
              'id', pf.id,
              'filename', pf.filename,
              'file_size', pf.file_size,
              'is_main', pf.is_main
            ) ORDER BY pf.sort_order ASC)
            FROM product_files pf
            WHERE pf.product_id = p.id
          ) AS files,
          COALESCE(
            (SELECT m.thumbnail_url FROM product_media m WHERE m.product_id = p.id ORDER BY m.sort_order ASC LIMIT 1),
            '/placeholder.svg'
          ) AS thumbnail
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        LEFT JOIN categories c ON c.id = p.category_id
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
      `,
      [user.id]
    )
    return { items: result.rows }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('User purchases error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch purchases' })
  }
})
