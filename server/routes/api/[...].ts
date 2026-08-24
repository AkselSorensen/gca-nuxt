// Monte l'application Express (ancien backend gsa_tresingo) dans Nitro en
// CHARGEMENT PAUTIF : le monolithe (stripe, pdfkit, aws-sdk, initializeDatabase)
// n'est importé que lorsqu'une route /api/* non gérée par les modules Nitro
// est réellement appelée → cold start ~x3 plus rapide.
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
