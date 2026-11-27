// Réchauffe les pages et API publiques en local : le premier visiteur (après un démarrage ou une modification admin)
// ne paie plus le calcul à froid (rendu de la page, requêtes, caches mémoire).
const PATHS = ['/api/bootstrap', '/api/products', '/catalogue', '/']
let running = false

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
