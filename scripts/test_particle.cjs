// Test : produit en catégorie particle → visible ?
require('dotenv').config();
const B = 'http://localhost:3101';
const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
(async () => {
  const login = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }), credentials: 'include' });
  const ck = login.headers.get('set-cookie')?.split(';')[0] || '';
  const body = { title: 'Particle Test X', shortDescription: 'test', description: 'test', installation: 'test', categorySlug: 'particle', sellerSlug: 'tresingo', price: '10', oldPrice: '', platform: 'Garry\'s Mod', tags: [], thumbnail: tinyPng };
  const create = await fetch(B + '/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: ck }, body: JSON.stringify(body) });
  const created = await create.json().catch(() => ({}));
  console.log('create:', create.status, created.id || created.message || '');
  const id = created.id;
  if (id) {
    const list = await fetch(B + '/api/products?c=particle').then(r => r.json());
    const prods = list.products || list.items || list;
    const found = (Array.isArray(prods) ? prods : []).filter((p: any) => p.id === id);
    console.log('dans /api/products?c=particle:', found.length ? 'OUI ✓' : 'NON ✗');
    const db = await (await import('pg')).default;
    process.exit(0);
  }
})();
