// Service : R2 (Cloudflare) - client + presigner (réplique du monolithe)
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ENDPOINT = process.env.R2_ENDPOINT || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET = process.env.R2_BUCKET || 'gca-files'

export const r2Client = R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    })
  : null

// Client dédié aux envois en flux (gros fichiers) : pas de somme de contrôle ajoutée automatiquement,
// R2 ne gère pas les en-têtes de checksum en pied de flux.
export const r2Streaming = R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
  ? new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    } as any)
  : null

export { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, R2_BUCKET }

export async function r2SignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(r2Client!, new GetObjectCommand({ Bucket: R2_BUCKET, Key: storagePath }), { expiresIn })
}

// Upload une image (data URL base64) vers R2 + crée la row product_media.
// Retourne { mediaId, url: /api/media/:id, key, size }.
// L'URL publique reste /api/media/:id (proxy R2 avec cache navigateur 7j).
// main = true : image mise en avant (rang 0). Sinon : image de galerie, rang = dernier rang + 1.
export async function uploadImageToR2(productId: number, dataUrl: string, mime = 'image/jpeg', main = false) {
  if (!r2Client) throw new Error('R2 non configuré')
  const base64 = String(dataUrl).replace(/^data:[^;,]+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  const ext = (mime || 'image/jpeg').split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
  const key = `products/${productId}/images/${Date.now()}.${ext}`
  await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: mime || 'image/jpeg' }))

  const { query } = await import('./db')
  let sortOrder = 0
  if (!main) {
    const next = await query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next FROM product_media WHERE product_id = $1', [productId])
    sortOrder = Math.max(1, Number(next.rows[0].next))
  }
  const inserted = await query(
    `INSERT INTO product_media (product_id, media_type, url, thumbnail_url, storage_path, sort_order)
     VALUES ($1, 'image', $2, $2, $3, $4) RETURNING id`,
    [productId, '/api/media/placeholder', key, sortOrder]
  )
  const mediaId = inserted.rows[0].id
  await query('UPDATE product_media SET url = $1, thumbnail_url = $1 WHERE id = $2', [`/api/media/${mediaId}`, mediaId])

  // Miniatures prêtes dès l'envoi (en arrière-plan) : le premier visiteur n'attend pas leur création
  // Décalé de 4 s : la réponse et le rafraîchissement de l'admin passent d'abord, sans concurrence de calcul
  new Promise((r) => setTimeout(r, 4000)).then(() => import('../utils/mediaVariants')).then((m) => m.ensureVariants(key)).catch((e) => console.warn('[miniatures] échec :', e?.message || e))

  return { mediaId, url: `/api/media/${mediaId}`, key, size: buffer.length }
}
