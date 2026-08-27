// Service : produits (réplique des helpers du monolithe Express)
import { query } from './db'

export function buildWhereClause(query: Record<string, any> = {}) {
  const clauses: string[] = []
  const values: any[] = []
  let index = 1

  if (query.search) {
    clauses.push(
      `(p.title ILIKE $${index} OR p.short_description ILIKE $${index} OR p.description ILIKE $${index} OR array_to_string(p.tags, ' ') ILIKE $${index})`
    )
    values.push(`%${query.search}%`)
    index += 1
  }
  if (query.category) {
    clauses.push(`c.slug = $${index}`)
    values.push(String(query.category))
    index += 1
  }
  if (query.tag) {
    clauses.push(`$${index} = ANY(p.tags)`)
    values.push(String(query.tag))
    index += 1
  }
  if (query.discount === 'true') {
    clauses.push(`p.discount_percent > 0`)
  }
  if (query.price_min) {
    clauses.push(`p.price >= $${index}`)
    values.push(Number(query.price_min))
    index += 1
  }
  if (query.price_max) {
    clauses.push(`p.price <= $${index}`)
    values.push(Number(query.price_max))
    index += 1
  }
  if (query.rating) {
    clauses.push(`p.rating >= $${index}`)
    values.push(Number(query.rating))
    index += 1
  }
  clauses.push(`p.is_hidden = FALSE`)

  return {
    sql: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '',
    values,
  }
}

// Convertit une URL media : data:base64 → /api/media/:id (léger), sinon inchangé.
// Évite d'embarquer des Mo de base64 dans les réponses liste/recherche.
export function mediaUrl(url: any, mediaId: any): string | null {
  if (!url) return null
  const s = String(url)
  if (s.startsWith('data:')) return `/api/media/${mediaId}`
  return s
}

export function mapProduct(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    description: row.description,
    installation: row.installation,
    price: Number(row.price),
    oldPrice: Number(row.old_price || row.price),
    platform: row.platform || "Garry's Mod",
    videoUrl: row.video_url || null,
    discountPercent: row.discount_percent,
    rating: row.review_count > 0 ? Number(row.rating) : null,
    reviewCount: row.review_count,
    views: row.views,
    isTrending: row.is_trending,
    isFeatured: row.is_featured,
    isNew: row.is_new,
    popularityScore: row.popularity_score,
    sellerName: row.seller_name,
    sellerSlug: row.seller_slug,
    sellerAvatar: row.seller_avatar,
    category: row.category_name,
    categorySlug: row.category_slug,
    tags: row.tags || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    media: (row.media || []).map((m: any) => ({
      id: m.id,
      type: m.type,
      sortOrder: m.sortOrder,
      thumbnail: mediaUrl(m.thumbnail, m.id),
      url: mediaUrl(m.url, m.id),
    })),
  }
}

export async function getProductBySlug(slug: string, userId: number | null = null) {
  const result = await query(
    `
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug,
        s.display_name AS seller_name,
        s.slug AS seller_slug,
        s.avatar_url AS seller_avatar,
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
      JOIN users s ON s.id = p.seller_id
      LEFT JOIN product_media pm ON pm.product_id = p.id
      WHERE p.slug = $1
      GROUP BY p.id, c.name, c.slug, s.display_name, s.slug, s.avatar_url
      LIMIT 1
    `,
    [slug]
  )

  if (!result.rowCount) return null
  const product = mapProduct(result.rows[0])

  const reviewsResult = await query(
    `
      SELECT
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.user_id,
        u.display_name,
        u.avatar_url
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.product_id = $1
      ORDER BY r.created_at DESC
    `,
    [product.id]
  )

  product.reviews = reviewsResult.rows.map((review: any) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    displayName: review.display_name,
    avatarUrl: review.avatar_url,
    createdAt: review.created_at,
    mine: userId ? review.user_id === userId : false,
  }))

  return product
}
