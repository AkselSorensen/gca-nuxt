require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function safeDelete(sql, params, label) {
  try {
    const r = await p.query(sql, params);
    console.log(`  ${label}: ${r.rowCount} ligne(s)`);
  } catch (e) {
    console.log(`  ${label}: ignoré (${e.message.split('\n')[0]})`);
  }
}

(async () => {
  const r = await p.query(
    `SELECT id, display_name, slug, email, role
     FROM users
     WHERE display_name ILIKE '%tresing%' OR slug ILIKE '%tresing%' OR email ILIKE '%tresing%'`
  );
  console.log('Profil(s) trouvé(s):', JSON.stringify(r.rows));

  for (const u of r.rows) {
    if (u.id === 1) { console.log('SKIP admin id=1'); continue; }
    console.log(`Suppression id=${u.id} (${u.display_name})...`);
    await safeDelete('DELETE FROM reviews WHERE user_id = $1', [u.id], 'reviews');
    await safeDelete('DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1)', [u.id], 'cart_items');
    await safeDelete('DELETE FROM carts WHERE user_id = $1', [u.id], 'carts');
    await safeDelete('DELETE FROM user_sessions WHERE user_id = $1', [u.id], 'user_sessions');
    await safeDelete('DELETE FROM orders WHERE user_id = $1', [u.id], 'orders');
    await safeDelete('DELETE FROM notifications WHERE user_id = $1', [u.id], 'notifications');
    const del = await p.query('DELETE FROM users WHERE id = $1', [u.id]);
    console.log(`  users: ${del.rowCount} supprimé`);
  }

  const after = await p.query('SELECT id, display_name, role FROM users');
  console.log('Users restants:', JSON.stringify(after.rows));
  await p.end();
})().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });
