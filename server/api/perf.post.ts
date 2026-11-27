// POST /api/perf - reçoit les mesures de chargement des visiteurs et les écrit dans les logs ([perf]).
import { defineEventHandler, readBody, setResponseStatus } from 'h3'

let count = 0
let windowStart = Date.now()

export default defineEventHandler(async (event) => {
  // Limite : 60 mesures par minute au total
  if (Date.now() - windowStart > 60_000) { windowStart = Date.now(); count = 0 }
  if (++count > 60) { setResponseStatus(event, 204); return '' }
  try {
    const b: any = await readBody(event)
    const slow = Array.isArray(b?.slow) ? b.slow.slice(0, 5).map((s: any) => `${String(s.u).slice(0, 80)} ${Number(s.d)}ms ${Number(s.kb)}Ko`).join(' | ') : ''
    console.log(`[perf] ${String(b?.kind).slice(0, 6)} ${String(b?.path).slice(0, 80)} ttfb=${b?.ttfb ?? '-'} total=${b?.load ?? '-'}ms lcp=${b?.lcp ?? '-'}ms lcpEl=${String(b?.lcpUrl || '-').slice(0, 90)} net=${String(b?.net || '-').slice(0, 8)} :: ${slow}`)
  } catch { /* ignoré */ }
  setResponseStatus(event, 204)
  return ''
})
