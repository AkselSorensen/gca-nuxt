// Route Nitro : /sitemap.xml
// Génère un sitemap XML valide : pages statiques + produits visibles + catégories.
import { query } from '../services/db'

const BASE_URL = 'https://gsa-store.fr'

// Pages statiques - priority 1.0 pour la home, 0.5 pour les autres.
const STATIC_PAGES = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/catalogue', priority: '0.9', freq: 'daily' },
  { path: '/prestation', priority: '0.6', freq: 'monthly' },
  { path: '/about', priority: '0.5', freq: 'monthly' },
  { path: '/fondations', priority: '0.5', freq: 'monthly' },
  { path: '/contact', priority: '0.4', freq: 'yearly' },
  { path: '/mentions-legales', priority: '0.2', freq: 'yearly' },
  { path: '/cgu', priority: '0.2', freq: 'yearly' },
  { path: '/cgv', priority: '0.2', freq: 'yearly' },
  { path: '/confidentialite', priority: '0.2', freq: 'yearly' },
  { path: '/cookies', priority: '0.2', freq: 'yearly' },
  { path: '/retractation', priority: '0.2', freq: 'yearly' },
  { path: '/contrat-vendeur', priority: '0.2', freq: 'yearly' }
]

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(loc: string, lastmod: string, priority: string, freq = 'weekly'): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export default defineEventHandler(async (event) => {
  const now = new Date().toISOString()
  const urls = STATIC_PAGES.map((page) =>
    urlEntry(`${BASE_URL}${page.path}`, now, page.priority, page.freq)
  )

  try {
    // Produits visibles uniquement (is_hidden = false) - priority 0.8.
    const { rows: products } = await query(
      'SELECT slug, updated_at FROM products WHERE is_hidden = false'
    )
    for (const product of products) {
      urls.push(
        urlEntry(
          `${BASE_URL}/product/${escapeXml(product.slug)}`,
          new Date(product.updated_at || Date.now()).toISOString(),
          '0.8',
          'weekly'
        )
      )
    }

    // Catégories - priority 0.6.
    const { rows: categories } = await query('SELECT slug FROM categories')
    for (const category of categories) {
      urls.push(
        urlEntry(
          `${BASE_URL}/catalogue?c=${encodeURIComponent(category.slug)}`.replace(/&/g, '&amp;'),
          now,
          '0.7',
          'daily'
        )
      )
    }
  } catch (error) {
    console.error('[sitemap] Erreur lors de la récupération des données dynamiques :', error)
  }

  try {
    // Profils vendeurs publics
    const { rows: sellers } = await query(
      "SELECT slug FROM users WHERE role = 'seller' AND slug IS NOT NULL AND slug <> ''"
    )
    for (const seller of sellers) {
      urls.push(urlEntry(`${BASE_URL}/seller/${escapeXml(seller.slug)}`, now, '0.5', 'weekly'))
    }
  } catch (error) {
    console.error('[sitemap] Vendeurs indisponibles :', error)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
