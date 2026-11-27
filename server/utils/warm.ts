// Réchauffe les pages et API publiques en local : le premier visiteur (après un démarrage ou une modification admin)
// ne paie plus le calcul à froid (rendu de la page, requêtes, caches mémoire).
const PATHS = ['/api/bootstrap', '/api/products', '/catalogue', '/']
let running = false

// Charge toutes les miniatures en mémoire du serveur (cache de /api/media) : elles pèsent quelques Mo au total.
// Ensuite aucune image n'est relue sur R2 (0,5-1 s) : elles sortent de la RAM en quelques millisecondes.
export async function warmMedia(): Promise<void> {
  const { query } = await import('../services/db')
  const rows = (await query(`SELECT id FROM product_media WHERE media_type = 'image' ORDER BY id DESC`)).rows as any[]
  const base = `http://127.0.0.1:${process.env.PORT || process.env.NITRO_PORT || 3000}`
  const jobs: string[] = []
  for (const r of rows) for (const w of [160, 320, 640, 1280]) jobs.push(`${base}/api/media/${r.id}.webp?w=${w}`)
  let i = 0
  const worker = async () => {
    while (i < jobs.length) {
      const url = jobs[i++]
      try { await fetch(url, { signal: AbortSignal.timeout(15000) }).then((r) => r.arrayBuffer()) } catch { /* ignoré */ }
    }
  }
  await Promise.all([worker(), worker(), worker()])
  console.log(`[warm] ${rows.length} image(s) chargées en mémoire`)
}

export async function warmPublic(): Promise<void> {
  if (running) return
  running = true
  const base = `http://127.0.0.1:${process.env.PORT || process.env.NITRO_PORT || 3000}`
  try {
    for (const p of PATHS) {
      try { await fetch(base + p, { headers: { 'x-warm': '1' }, signal: AbortSignal.timeout(20000) }).then((r) => r.arrayBuffer()) } catch { /* ignoré */ }
    }
  } finally { running = false }
}
