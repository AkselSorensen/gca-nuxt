// Images servies par /api/media/:id en version redimensionnée WebP : `/api/media/76.webp?w=640`.
// L'extension .webp permet à Cloudflare de les garder en cache (il ne met pas en cache les URLs sans extension) :
// les visites suivantes ne touchent plus le serveur. Les autres URLs (externes, data:) restent inchangées.
const RE = /^\/api\/media\/(\d+)$/

export function mediaSrc(url: any, width: number): string {
  const s = String(url || '')
  const m = s.match(RE)
  if (!m) return s
  return `/api/media/${m[1]}.webp?w=${width}`
}

export function mediaSrcset(url: any, widths: number[]): string | undefined {
  const s = String(url || '')
  const m = s.match(RE)
  if (!m) return undefined
  return widths.map((w) => `/api/media/${m[1]}.webp?w=${w} ${w}w`).join(', ')
}
