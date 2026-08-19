// Monte l'application Express complète (ancien backend gsa_tresingo) dans Nitro.
// Toutes les routes /api/* et /auth/* non gérées par les pages Nuxt passent ici.
import { fromNodeMiddleware } from 'h3'
// @ts-ignore — module CommonJS exporté par server/express/server.cjs
import expressApp from '../../express/server.cjs'

export default fromNodeMiddleware(expressApp)
