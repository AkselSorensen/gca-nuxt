// Cache navigateur des fiches produit : cliquer sur une carte affiche la fiche immédiatement
// (données déjà préchargées au survol), puis la page se rafraîchit discrètement en arrière-plan.
const store = new Map<string, any>()
const pending = new Set<string>()

export function getCachedProduct(slug: string) {
  return import.meta.client ? store.get(slug) : undefined
}

export function setCachedProduct(slug: string, data: any) {
  if (import.meta.client && data) store.set(slug, data)
}

export function prefetchProduct(slug: string) {
  if (!import.meta.client || !slug || store.has(slug) || pending.has(slug)) return
  pending.add(slug)
  const api = useRuntimeConfig().public.apiOrigin
  $fetch(api + '/api/products/' + slug, { credentials: 'include' })
    .then((data: any) => {
      store.set(slug, data)
      // Image principale chargée d'avance
      const url = data?.product?.media?.[0]?.url || data?.media?.[0]?.url
      if (url) { const img = new Image(); img.src = mediaSrc(url, 1280) }
    })
    .catch(() => {})
    .finally(() => pending.delete(slug))
}
