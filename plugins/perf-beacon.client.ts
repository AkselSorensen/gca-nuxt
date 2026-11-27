// Mesures réelles chez les visiteurs : temps de chargement et ressources les plus lentes de chaque page.
// Envoyées au serveur (aucune donnée personnelle : chemin de la page + durées) et lisibles dans ses logs ([perf]).
export default defineNuxtPlugin((nuxtApp) => {
  let lcp = 0
  let lcpUrl = ''
  try {
    new PerformanceObserver((list) => {
      const e: any = list.getEntries().pop()
      if (e) { lcp = Math.round(e.startTime); lcpUrl = String(e.url || e.element?.tagName || '').replace(location.origin, '').slice(0, 90) }
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  } catch { /* navigateur sans LCP */ }

  let t0 = 0
  let first = true
  const send = (kind: string, from: number) => {
    setTimeout(() => {
      const nav: any = performance.getEntriesByType('navigation')[0]
      const slow = performance.getEntriesByType('resource')
        .filter((r: any) => r.startTime >= from)
        .map((r: any) => ({ u: r.name.replace(location.origin, '').slice(0, 80), d: Math.round(r.duration), kb: Math.round((r.transferSize || 0) / 1024) }))
        .sort((a, b) => b.d - a.d).slice(0, 5)
      const body = JSON.stringify({
        kind, path: location.pathname,
        ttfb: kind === 'load' && nav ? Math.round(nav.responseStart) : undefined,
        load: kind === 'load' && nav ? Math.round(nav.loadEventEnd) : Math.round(performance.now() - from),
        lcp: lcp || undefined, lcpUrl: lcpUrl || undefined,
        net: (navigator as any).connection?.effectiveType, slow,
      })
      try { navigator.sendBeacon('/api/perf', new Blob([body], { type: 'application/json' })) } catch { /* ignoré */ }
    }, 3000)
  }

  nuxtApp.hook('page:start', () => { t0 = performance.now() })
  nuxtApp.hook('page:finish', () => {
    if (first) { first = false; window.addEventListener('load', () => send('load', 0), { once: true }); return }
    lcp = 0; lcpUrl = ''
    send('nav', t0)
  })
})
