// Monte l'application Express complète pour les routes /auth/* (Discord, Steam).
import { fromNodeMiddleware } from 'h3'
// @ts-ignore — module CommonJS exporté par server/express/server.cjs
import expressApp from '../../express/server.cjs'

export default fromNodeMiddleware(expressApp)
