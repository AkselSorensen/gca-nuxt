// Journal des requêtes lentes : toute route /api ou page qui dépasse 300 ms est écrite dans les logs
// (docker compose logs app | grep "\[lent\]") pour voir ce qui coince réellement.
const THRESHOLD_MS = Number(process.env.SLOW_REQUEST_MS || 300)

export default defineEventHandler((event) => {
  const url = event.node.req.url || ''
  if (url.startsWith('/_nuxt/') || url.startsWith('/api/media/')) return
  const start = Date.now()
  event.node.res.once('finish', () => {
    const ms = Date.now() - start
    if (ms >= THRESHOLD_MS) {
      console.warn(`[lent] ${ms} ms ${event.node.req.method} ${url.split('?')[0]} -> ${event.node.res.statusCode}`)
    }
  })
})
