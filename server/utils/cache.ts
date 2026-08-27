// Purge du cache de routes Nitro (SWR) — à appeler après toute mutation admin
// d'un produit : sans ça la marketplace sert l'ancien prix pendant la durée du SWR
// (routeRules : '/' 60 s, '/catalogue' + '/product/**' 300 s).
import { useStorage } from '#imports'

export async function purgeRouteCache(): Promise<number> {
  try {
    const storage = useStorage('cache')
    const keys = await storage.getKeys('nitro:routes')
    await Promise.all(keys.map((k: string) => storage.removeItem(k)))
    // Le cache des handlers (defineCachedEventHandler / defineCachedFunction) aussi
    const fnKeys = await storage.getKeys('nitro:functions')
    await Promise.all(fnKeys.map((k: string) => storage.removeItem(k)))
    const total = keys.length + fnKeys.length
    if (total) console.log('[cache] purge SWR :', total, 'entrée(s)')
    return total
  } catch (e: any) {
    console.warn('[cache] purge impossible:', e?.message || e)
    return 0
  }
}
