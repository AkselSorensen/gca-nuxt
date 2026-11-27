// Ajoute ?w=<largeur> aux images servies par /api/media/:id pour obtenir une version redimensionnée (WebP).
// Les autres URLs (externes, data:) restent inchangées.
export function mediaSrc(url: any, width: number): string {
  const s = String(url || '')
  if (!s || !/^\/api\/media\/\d+$/.test(s)) return s
  return s + '?w=' + width
}

export function mediaSrcset(url: any, widths: number[]): string | undefined {
  const s = String(url || '')
  if (!s || !/^\/api\/media\/\d+$/.test(s)) return undefined
  return widths.map((w) => `${s}?w=${w} ${w}w`).join(', ')
}
