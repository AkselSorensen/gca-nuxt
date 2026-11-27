// Autorise le navigateur à envoyer directement les fichiers sur R2 (URL signée) depuis le site.
// Idempotent, au démarrage ; en cas d'échec (droits du jeton), l'envoi bascule sur l'ancien chemin via le serveur.
import { PutBucketCorsCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET } from '../services/r2'

export default defineNitroPlugin(() => {
  if (!r2Client) return
  setTimeout(async () => {
    try {
      const origins = (process.env.R2_CORS_ORIGINS || 'https://gsa-store.fr,https://www.gsa-store.fr').split(',').map((s) => s.trim()).filter(Boolean)
      await r2Client!.send(new PutBucketCorsCommand({
        Bucket: R2_BUCKET,
        CORSConfiguration: {
          CORSRules: [{
            AllowedOrigins: origins,
            AllowedMethods: ['PUT', 'GET', 'HEAD'],
            AllowedHeaders: ['*'],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 86400,
          }],
        },
      }))
      console.log('[r2] CORS configuré pour', origins.join(', '))
    } catch (e: any) {
      console.warn('[r2] CORS non configuré (envoi direct indisponible, repli par le serveur) :', e?.message || e)
    }
  }, 8000)
})
