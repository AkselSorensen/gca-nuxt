// Test : produit avec tag tendance → présent dans trending bootstrap ?
require('dotenv').config();
const B = 'http://localhost:3100';
const tinyPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

(async () => {
  const login = await fetch(B + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }) })
  const cookie = login.headers.get('set-cookie')?.split(';')[0]
  console.log('login:', login.status)

  const create = await fetch(B + '/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ title: 'Test Tendance', shortDescription: 'test', description: 'test', installation: 'test', categorySlug: '', sellerSlug: '', price: 10, discountPercent: 0, platform: "Garry's Mod", tags: ['tendance'], thumbnail: tinyPng, isHidden: false })
  })
  const created = await create.json()
  console.log('create:', create.status, '| id:', created.id || created.message)

  if (created.id) {
    const bs = await fetch(B + '/api/bootstrap', { headers: { Cookie: cookie } }).then(r => r.json())
    console.log('trending:', (bs.trending || []).map((p) => p.title).join(' | ') || '(VIDE)')
    console.log('totalProducts:', bs.totalProducts)
    // cleanup
    const del = await fetch(B + '/api/admin/products/' + created.id, { method: 'DELETE', headers: { Cookie: cookie } })
    console.log('cleanup:', del.status)
  }
})().catch(e => console.log('ERR:', e.message))