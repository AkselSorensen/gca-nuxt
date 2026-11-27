// GET /api/sellers/:slug - profil public d'un vendeur (remplace la version lente du serveur Express)
// Requêtes en parallèle + cache mémoire 60 s (vidé à chaque modification admin).
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../services/db'
import { memo } from '../../utils/memo'

async function loadSeller(slug: string) {
  const sellerResult = await query(
    `SELECT id, display_name, slug, avatar_url, role, discord_id, discord_tag, seller_description, created_at
     FROM users WHERE slug = $1 AND role IN ('seller', 'admin') LIMIT 1`,
    [slug]
  )
  if (!sellerResult.rowCount) return null
  const seller = sellerResult.rows[0]

  const [productsResult, statsResult, ratingResult, reviewsResult] = await Promise.all([
    query(
      `SELECT p.id, p.slug, p.title, p.short_description, p.price, p.old_price, p.discount_percent,
              p.rating, p.review_count, p.tags, c.name AS category_name,
              pm.id AS media_id, pm.thumbnail_url AS thumbnail
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN LATERAL (
         SELECT id, thumbnail_url FROM product_media WHERE product_id = p.id ORDER BY sort_order ASC, id ASC LIMIT 1
       ) pm ON TRUE
       WHERE p.seller_id = $1 AND p.is_hidden = FALSE
       ORDER BY p.popularity_score DESC, p.created_at DESC`,
      [seller.id]
    ),
    query(
      `SELECT COALESCE(SUM(oi.quantity), 0) AS units_sold,
              COALESCE(SUM(oi.price * oi.quantity), 0) AS total_revenue,
              COALESCE(SUM(ROUND((oi.price * oi.quantity * (1 - u.commission_percent::numeric / 100))::numeric, 2)), 0) AS seller_net_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN users u ON u.id = oi.seller_id
       WHERE oi.seller_id = $1 AND o.status = 'completed'`,
      [seller.id]
    ),
    query(
      `SELECT COALESCE(AVG(r.rating), 0)::numeric AS avg_rating
       FROM reviews r JOIN products p2 ON p2.id = r.product_id WHERE p2.seller_id = $1`,
      [seller.id]
    ),
    query(
      `SELECT r.id, r.product_id, r.rating, r.comment, r.created_at,
              u.display_name AS reviewer_name, u.avatar_url AS reviewer_avatar, p.title AS product_title
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       WHERE p.seller_id = $1
       ORDER BY r.created_at DESC
       LIMIT 60`,
      [seller.id]
    ),
  ])

  const stats = statsResult.rows[0]
  const avg = Number(ratingResult.rows[0].avg_rating)

  return {
    seller: {
      displayName: seller.display_name,
      slug: seller.slug,
      avatarUrl: seller.avatar_url,
      bio: seller.seller_description || '',
      discordId: seller.discord_id,
      discordTag: seller.discord_tag || '',
      discordLinked: !!seller.discord_id,
      joinedAt: seller.created_at,
      totalUnitsSold: parseInt(stats.units_sold || 0),
      totalRevenue: parseFloat(stats.total_revenue || 0),
      sellerNetRevenue: parseFloat(stats.seller_net_revenue || 0),
      avgRating: avg > 0 ? Number(avg.toFixed(2)) : null,
    },
    reviews: reviewsResult.rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_title,
      rating: Number(r.rating),
      comment: r.comment,
      createdAt: r.created_at,
      reviewerName: r.reviewer_name,
      reviewerAvatar: r.reviewer_avatar,
    })),
    products: productsResult.rows.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      shortDescription: row.short_description,
      price: Number(row.price),
      oldPrice: Number(row.old_price),
      discountPercent: row.discount_percent,
      rating: row.review_count > 0 ? Number(row.rating) : null,
      reviewCount: row.review_count,
      tags: row.tags || [],
      categoryName: row.category_name,
      // Image en base64 → servie par /api/media/:id (redimensionnée et mise en cache)
      thumbnail: row.thumbnail && String(row.thumbnail).startsWith('data:') && row.media_id ? `/api/media/${row.media_id}` : (row.thumbnail || ''),
      sellerName: seller.display_name,
    })),
  }
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug requis' })
  try {
    const data = await memo('seller:' + slug, 60_000, () => loadSeller(slug))
    if (!data) throw createError({ statusCode: 404, statusMessage: 'Seller not found' })
    return data
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Seller profile error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch seller details' })
  }
})
