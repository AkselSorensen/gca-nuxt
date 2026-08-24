// GET /api/bootstrap — données de la home (réplique du monolithe Express)
import { defineEventHandler, createError } from 'h3'
import { query } from '../services/db'
import { getSessionUser, getSessionLocale } from '../utils/auth'

const DISCORD_INVITE = 'https://discord.gg/ZbCrwE73uK'

export default defineEventHandler(async (event) => {
  try {
    const [sessionUser, locale] = await Promise.all([getSessionUser(event), getSessionLocale(event)])

    const [categories, trending, discounts, featured, stats] = await Promise.all([
      query(`SELECT c.name, c.slug, c.description, COALESCE(COUNT(p.id), 0)::int AS "productCount" FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_hidden = FALSE GROUP BY c.name, c.slug, c.description, c.sort_order ORDER BY c.sort_order ASC, c.name ASC`),
      query(
        `
          SELECT
            p.id,
            p.slug,
            p.title,
            p.short_description,
            p.price,
            p.old_price AS "oldPrice",
            p.discount_percent AS "discountPercent",
            p.rating,
            p.review_count AS "reviewCount",
            p.tags,
            p.is_featured,
            p.is_trending AS "isTrending",
            p.popularity_score AS "popularityScore",
            p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            COALESCE(
              (
                SELECT pm.thumbnail_url
                FROM product_media pm
                WHERE pm.product_id = p.id
                ORDER BY pm.sort_order ASC, pm.id ASC
                LIMIT 1
              ),
              ''
            ) AS thumbnail,
            (
              SELECT pm.id
              FROM product_media pm
              WHERE pm.product_id = p.id
              ORDER BY pm.sort_order ASC, pm.id ASC
              LIMIT 1
            ) AS thumbnail_id
          FROM products p
          WHERE (p.is_trending = TRUE OR EXISTS (SELECT 1 FROM unnest(p.tags) AS t WHERE LOWER(t) = 'tendance'))
          ORDER BY p.popularity_score DESC, p.views DESC
          LIMIT 8
        `
      ),
      query(
        `
          SELECT
            p.id,
            p.slug,
            p.title,
            p.short_description,
            p.price,
            p.old_price AS "oldPrice",
            p.discount_percent AS "discountPercent",
            p.rating,
            p.review_count AS "reviewCount",
            p.tags,
            p.popularity_score AS "popularityScore",
            p.created_at AS "createdAt",
            p.updated_at AS "updatedAt",
            COALESCE(
              (
                SELECT pm.thumbnail_url
                FROM product_media pm
                WHERE pm.product_id = p.id
                ORDER BY pm.sort_order ASC, pm.id ASC
                LIMIT 1
              ),
              ''
            ) AS thumbnail,
            (
              SELECT pm.id
              FROM product_media pm
              WHERE pm.product_id = p.id
              ORDER BY pm.sort_order ASC, pm.id ASC
              LIMIT 1
            ) AS thumbnail_id
          FROM products p
          WHERE p.discount_percent > 0
          ORDER BY p.discount_percent DESC, p.views DESC
          LIMIT 6
        `
      ),
      query(
        `
          SELECT
            c.slug AS category_slug,
            c.name AS category_name,
            json_agg(
              json_build_object(
                'id', p.id,
                'slug', p.slug,
                'title', p.title,
                'shortDescription', p.short_description,
                'price', p.price,
                'oldPrice', p.old_price,
                'discountPercent', p.discount_percent,
                'rating', p.rating,
                'reviewCount', p.review_count,
                'thumbnail', COALESCE(
                  (
                    SELECT pm.thumbnail_url
                    FROM product_media pm
                    WHERE pm.product_id = p.id
                    ORDER BY pm.sort_order ASC, pm.id ASC
                    LIMIT 1
                  ),
                  ''
                ),
                'thumbnailId', (
                  SELECT pm.id
                  FROM product_media pm
                  WHERE pm.product_id = p.id
                  ORDER BY pm.sort_order ASC, pm.id ASC
                  LIMIT 1
                )
              )
              ORDER BY p.popularity_score DESC, p.created_at DESC
            ) AS products
          FROM categories c
          JOIN LATERAL (
            SELECT *
            FROM products p
            WHERE p.category_id = c.id
            ORDER BY p.popularity_score DESC, p.created_at DESC
            LIMIT 5
          ) p ON TRUE
          GROUP BY c.slug, c.name, c.sort_order
          ORDER BY MIN(c.sort_order) ASC
        `
      ),
      query(`
        SELECT
          (SELECT COUNT(*) FROM products WHERE is_hidden = FALSE)::int AS "totalProducts",
          (SELECT COALESCE(SUM(oi.quantity), 0) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE o.status = 'completed')::int AS "totalSales",
          (SELECT COALESCE(AVG(rating), 0) FROM products WHERE is_hidden = FALSE)::float AS "avgRating",
          (SELECT COUNT(DISTINCT seller_id) FROM products WHERE is_hidden = FALSE)::int AS "totalCreators"
      `),
    ])

    const [landingConfig, sellers] = await Promise.all([
      query('SELECT * FROM admin_landing_config ORDER BY id ASC'),
      query(`SELECT slug, display_name AS username FROM users WHERE role IN ('seller', 'admin') ORDER BY display_name ASC`),
    ])

    // Remplace les thumbnails base64 par des URLs /api/media/:id (léger + cache)
    const thumb = (p: any) => {
      if (p && p.thumbnail && String(p.thumbnail).startsWith('data:') && p.thumbnail_id) {
        return { ...p, thumbnail: `/api/media/${p.thumbnail_id}` }
      }
      if (p && p.thumbnailId && p.thumbnail && String(p.thumbnail).startsWith('data:')) {
        return { ...p, thumbnail: `/api/media/${p.thumbnailId}` }
      }
      return p
    }

    return {
      locale,
      user: sessionUser || null,
      categories: categories.rows,
      trending: trending.rows.map(thumb),
      discounts: discounts.rows.map(thumb),
      ...(stats.rows[0] || {}),
      featuredByCategory: featured.rows.map((row: any) => ({
        categorySlug: row.category_slug,
        categoryName: row.category_name,
        products: (row.products || []).map(thumb),
      })),
      landingConfig: landingConfig.rows,
      collaborators: ['Tresingo', 'Atelier Nova', 'Hexa Studio', 'Forge 27', 'Northline'],
      sellers: sellers.rows,
      communities: ['Nexus RP', 'Helios City', 'Sector 12', 'NovaLife', 'Blackridge RP'],
      discordInvite: DISCORD_INVITE,
    }
  } catch (error) {
    console.error('Bootstrap error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to load homepage data' })
  }
})
