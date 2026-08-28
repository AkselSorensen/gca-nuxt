require('dotenv').config();
const { Pool } = require('pg');
const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

(async () => {
  const c = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
  console.log('users:', c.rows.map(r => r.column_name).join(', '));
  const s = await p.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'seller_profiles' ORDER BY ordinal_position");
  if (s.rowCount) console.log('seller_profiles:', s.rows.map(r => r.column_name).join(', '));
  else console.log('seller_profiles: (n existe pas)');
  await p.end();
})().catch(e => { console.error('ERREUR:', e.message); process.exit(1); });
