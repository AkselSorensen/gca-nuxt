// Index de performance : créés au démarrage, en arrière-plan, de façon idempotente.
// Chaque requête est isolée : si une table/colonne manque, les autres index sont quand même créés.
import { pool } from '../services/db'

const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_product_media_product ON product_media (product_id, sort_order, id)',
  'CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id)',
  'CREATE INDEX IF NOT EXISTS idx_products_seller ON products (seller_id)',
  'CREATE INDEX IF NOT EXISTS idx_products_visible_pop ON products (is_hidden, popularity_score DESC, views DESC)',
  'CREATE INDEX IF NOT EXISTS idx_products_created ON products (created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_product_categories_cat ON product_categories (category_id, product_id)',
  'CREATE INDEX IF NOT EXISTS idx_product_categories_prod ON product_categories (product_id)',
  'CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id)',
  'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id)',
  'CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items (product_id)',
  'CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items (seller_id)',
  'CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id, created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status, created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items (cart_id)',
  'CREATE INDEX IF NOT EXISTS idx_product_files_product ON product_files (product_id)',
  'CREATE INDEX IF NOT EXISTS idx_users_slug ON users (slug)',
]

export default defineNitroPlugin(() => {
  // Laisse le serveur démarrer d'abord, puis crée les index sans bloquer les requêtes.
  setTimeout(async () => {
    let created = 0
    for (const sql of INDEXES) {
      try { await pool.query(sql); created++ } catch (e: any) { console.warn('[indexes] ignoré :', e?.message || e) }
    }
    console.log(`[indexes] ${created}/${INDEXES.length} vérifiés`)
  }, 5000)
})
