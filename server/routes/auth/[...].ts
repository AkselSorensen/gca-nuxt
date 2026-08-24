// Monte l'application Express pour les routes /auth/* (Discord, Steam legacy)
// en chargement pautif (voir server/routes/api/[...].ts).
import { defineEventHandler, fromNodeMiddleware } from 'h3'

let expressHandler: ReturnType<typeof fromNodeMiddleware> | null = null

export default defineEventHandler(async (event) => {
  if (!expressHandler) {
    // @ts-ignore — module CommonJS exporté par server/express/server.cjs
    const mod = await import('../../express/server.cjs')
    expressHandler = fromNodeMiddleware(mod.default || mod)
  }
  return expressHandler(event)
})
