// Service : panier (réplique du monolithe Express)
import { query } from './db'

export async function getCart(userId: number) {
  const cartResult = await query('SELECT id FROM carts WHERE user_id = $1 LIMIT 1', [userId])

  let cartId: number
  if (!cartResult.rowCount) {
    const inserted = await query('INSERT INTO carts (user_id) VALUES ($1) RETURNING id', [userId])
    cartId = inserted.rows[0].id
  } else {
    cartId = cartResult.rows[0].id
  }

  const itemsResult = await query(
    `
      SELECT
        ci.id,
        ci.quantity,
        p.id AS product_id,
        p.slug,
        p.title,
        p.price,
        p.old_price,
        p.discount_percent,
        p.seller_id,
        COALESCE(
          (
            SELECT json_build_object(
              'type', pm.media_type,
              'url', pm.url,
              'thumbnail', pm.thumbnail_url
            )
            FROM product_media pm
            WHERE pm.product_id = p.id
            ORDER BY pm.sort_order ASC, pm.id ASC
            LIMIT 1
          ),
          '{}'::json
        ) AS preview
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id DESC
    `,
    [cartId]
  )

  const items = itemsResult.rows.map((item: any) => ({
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product_id,
      slug: item.slug,
      title: item.title,
      price: Number(item.price),
      oldPrice: Number(item.old_price),
      discountPercent: item.discount_percent,
      preview: item.preview,
      sellerId: item.seller_id,
    },
    subtotal: Number(item.price) * item.quantity,
  }))

  return {
    id: cartId,
    items,
    total: items.reduce((sum: number, item: any) => sum + item.subtotal, 0),
  }
}

export async function syncClientCart(userId: number, clientItems: any[]) {
  if (!Array.isArray(clientItems) || !clientItems.length) return
  const cart = await getCart(userId)
  await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id])
  for (const item of clientItems) {
    const slug = (typeof item === 'string' ? item : String(item?.slug || '')).trim()
    if (!slug) continue
    const prodResult = await query('SELECT id FROM products WHERE slug = $1 AND is_hidden = FALSE LIMIT 1', [slug])
    if (prodResult.rowCount) {
      const qty = Math.max(1, Number(item?.quantity || 1))
      await query(
        `INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (cart_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
        [cart.id, prodResult.rows[0].id, qty]
      )
    }
  }
}
