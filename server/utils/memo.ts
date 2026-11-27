// Petit cache mémoire à durée courte pour les listes publiques (évite de refaire la même requête SQL
// à chaque visiteur). Vidé par purgeRouteCache() dès qu'un admin modifie un produit.
const store = new Map<string, { at: number; value: any }>()
const inflight = new Map<string, Promise<any>>()

export async function memo<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T
  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>
  const p = load().then((value) => {
    store.set(key, { at: Date.now(), value })
    if (store.size > 200) store.delete(store.keys().next().value as string)
    return value
  }).finally(() => { inflight.delete(key) })
  inflight.set(key, p)
  return p
}

export function clearMemo() { store.clear() }
