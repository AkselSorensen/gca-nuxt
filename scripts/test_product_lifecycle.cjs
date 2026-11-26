// Test de bout en bout : création d'un article, envoi d'un fichier, modification, puis SUPPRESSION.
// L'article de test est supprimé à la fin, même si une étape échoue (bloc finally).
//
// Utilisation (PowerShell) :
//   $env:ADMIN_EMAIL="..."; $env:ADMIN_PASSWORD="..."; node scripts/test_product_lifecycle.cjs https://gsa-store.fr
//
// Ce que le test vérifie :
//   1. connexion admin
//   2. POST /api/admin/products (le 502 éventuel apparaît ici, avec le temps de réponse)
//   3. POST /api/admin/products/:id/upload-stream (petit fichier)
//   4. PATCH /api/admin/products/:id : la vidéo YouTube doit rester après une modification
//   5. DELETE /api/admin/products/:id (nettoyage)

const BASE = (process.argv[2] || process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

let cookie = ''
const results = []
const ok = (name, pass, detail = '') => { results.push({ name, pass }); console.log((pass ? 'OK   ' : 'ECHEC') + '  ' + name + (detail ? '  - ' + detail : '')) }

async function call(method, path, { json, body, headers = {} } = {}) {
  const t0 = Date.now()
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(json ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
    body: json ? JSON.stringify(json) : body,
  })
  const text = await res.text()
  let data = null
  try { data = JSON.parse(text) } catch { /* corps non JSON (page d'erreur du proxy) */ }
  return { status: res.status, ms: Date.now() - t0, data, text, res }
}

;(async () => {
  if (!EMAIL || !PASSWORD) {
    console.error('Définissez ADMIN_EMAIL et ADMIN_PASSWORD (variables d\'environnement) avant de lancer le test.')
    process.exit(2)
  }
  console.log('Cible : ' + BASE)
  let productId = null
  try {
    // 1. connexion
    const login = await call('POST', '/api/auth/login', { json: { email: EMAIL, password: PASSWORD } })
    const setCookie = login.res.headers.get('set-cookie') || ''
    cookie = setCookie.split(';')[0]
    ok('connexion admin', login.status === 200 && !!cookie, 'HTTP ' + login.status + ', ' + login.ms + ' ms')
    if (!cookie) throw new Error('connexion impossible')

    // catégorie et vendeur existants
    const cats = await call('GET', '/api/categories')
    const catSlug = Array.isArray(cats.data) && cats.data[0]?.slug
    const me = await call('GET', '/api/me')
    const sellerSlug = me.data?.user?.slug || me.data?.user?.email
    ok('catégorie et vendeur trouvés', !!catSlug && !!sellerSlug, `catégorie=${catSlug} vendeur=${sellerSlug}`)
    if (!catSlug || !sellerSlug) throw new Error('prérequis manquants')

    // 2. création
    const create = await call('POST', '/api/admin/products', { json: {
      title: 'ZZ test automatique (à supprimer)',
      shortDescription: 'Article créé par le test automatique',
      description: '<p>Description <strong>de test</strong></p>',
      installation: '<p>Installation de test</p>',
      categorySlug: catSlug, sellerSlug, price: 1, discountPercent: 0,
      platform: "Garry's Mod", videoUrl: VIDEO, isHidden: true, tags: [], categories: [catSlug],
    } })
    productId = create.data?.id || null
    ok('création de l\'article (POST /api/admin/products)', create.status === 200 && !!productId,
      'HTTP ' + create.status + ', ' + create.ms + ' ms' + (create.status >= 500 ? '  <- ' + create.text.slice(0, 120) : ''))
    if (!productId) throw new Error('création impossible')

    // 3. envoi d'un petit fichier (flux binaire)
    const payload = Buffer.from('contenu de test ' + Date.now())
    const up = await call('POST', `/api/admin/products/${productId}/upload-stream?filename=test.txt`, {
      body: payload, headers: { 'Content-Type': 'application/octet-stream', 'Content-Length': String(payload.length) },
    })
    ok('envoi du fichier (upload-stream)', up.status === 200 && up.data?.ok === true,
      'HTTP ' + up.status + ', ' + up.ms + ' ms' + (up.status !== 200 ? '  <- ' + up.text.slice(0, 120) : ''))

    // 4. la vidéo doit survivre à une modification
    const list = await call('GET', '/api/admin/products')
    const found = Array.isArray(list.data) && list.data.find((p) => p.id === productId)
    ok('la liste admin renvoie la vidéo', !!found && found.video_url === VIDEO, 'video_url=' + (found?.video_url ?? 'absent'))
    const patch = await call('PATCH', `/api/admin/products/${productId}`, { json: {
      price: 2, videoUrl: found?.video_url || '', shortDescription: 'modifié', description: found?.description, installation: found?.installation,
    } })
    ok('modification (PATCH)', patch.status === 200, 'HTTP ' + patch.status + ', ' + patch.ms + ' ms')
    const list2 = await call('GET', '/api/admin/products')
    const after = Array.isArray(list2.data) && list2.data.find((p) => p.id === productId)
    ok('la vidéo est conservée après modification', after?.video_url === VIDEO, 'video_url=' + (after?.video_url ?? 'absent'))
  } catch (e) {
    ok('déroulement du test', false, e.message)
  } finally {
    // 5. nettoyage : l'article de test est toujours supprimé
    if (productId) {
      const del = await call('DELETE', `/api/admin/products/${productId}`)
      ok('suppression de l\'article de test', del.status === 200, 'HTTP ' + del.status)
    }
    const failed = results.filter((r) => !r.pass).length
    console.log('\n' + (failed ? failed + ' vérification(s) en échec' : 'Toutes les vérifications sont passées'))
    process.exit(failed ? 1 : 0)
  }
})()
