require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  // 1. Données enfants (FK-safe)
  await p.query('TRUNCATE order_items, orders, reviews, product_media, product_files, cart_items, carts, promo_redemptions, promo_codes RESTART IDENTITY CASCADE');
  console.log('1. commandes/avis/médias/paniers/promos: OK');

  // 2. Produits
  await p.query('TRUNCATE products RESTART IDENTITY CASCADE');
  console.log('2. produits: OK');

  // 3. Tags (metadata produits)
  await p.query('TRUNCATE tags RESTART IDENTITY CASCADE');
  console.log('3. tags: OK');

  // 4. Users SAUF admin (id=1)
  const del = await p.query("DELETE FROM users WHERE id <> 1");
  console.log('4. users supprimés:', del.rowCount);

  // 5. Sessions (déconnecte tout le monde, admin inclus — il se reconnectera)
  await p.query('TRUNCATE user_sessions');
  console.log('5. sessions: OK');

  // 6. Reset des séquences restantes
  await p.query("SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users),1))");
  await p.query("SELECT setval(pg_get_serial_sequence('categories','id'), COALESCE((SELECT MAX(id) FROM categories),1))");

  // 7. Vérification finale
  const counts = await p.query(`SELECT
    (SELECT COUNT(*) FROM users) u, (SELECT COUNT(*) FROM products) pr,
    (SELECT COUNT(*) FROM categories) c, (SELECT COUNT(*) FROM orders) o,
    (SELECT COUNT(*) FROM reviews) r`);
  console.log('VÉRIF:', JSON.stringify(counts.rows[0]));
  const admin = await p.query("SELECT id, email, role FROM users");
  console.log('USERS restants:', JSON.stringify(admin.rows));

  await p.end();
})().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });