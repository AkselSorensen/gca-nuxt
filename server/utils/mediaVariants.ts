// Miniatures WebP pré-générées sur R2 : `${storage_path}.w<largeur>.webp`.
// Évite que le premier visiteur attende 5-8 s pendant que le serveur télécharge l'original et le redimensionne.
import { r2Client, GetObjectCommand, PutObjectCommand, R2_BUCKET } from '../services/r2'
import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { query } from '../services/db'

export const VARIANT_WIDTHS = [160, 320, 480, 640, 1280]

async function exists(key: string): Promise<boolean> {
  try { await r2Client!.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key })); return true } catch { return false }
}

// Génère les variantes manquantes d'une image (l'original n'est téléchargé qu'une fois).
export async function ensureVariants(storagePath: string): Promise<number> {
  if (!r2Client || !storagePath) return 0
  const missing: number[] = []
  for (const w of VARIANT_WIDTHS) if (!(await exists(`${storagePath}.w${w}.webp`))) missing.push(w)
  if (!missing.length) return 0

  let sharp: any
  try { sharp = (await import('sharp')).default } catch { return 0 }
  const obj = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: storagePath }))
  const original = Buffer.from(await obj.Body!.transformToByteArray())
  if (obj.ContentType && !/^image\/(jpeg|png|webp|avif|tiff)/.test(obj.ContentType)) return 0 // gif/svg/vidéo : laissés tels quels

  let made = 0
  for (const w of missing) {
    const out = await sharp(original, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer()
    await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: `${storagePath}.w${w}.webp`, Body: out, ContentType: 'image/webp', CacheControl: 'public, max-age=31536000, immutable' }))
    made++
  }
  return made
}

// Parcourt toutes les images produits, une par une (faible charge CPU pour le petit VPS).
export async function warmAllVariants(): Promise<void> {
  if (!r2Client) return
  const rows = (await query(`SELECT storage_path FROM product_media WHERE storage_path IS NOT NULL AND media_type = 'image' ORDER BY id DESC`)).rows
  let made = 0
  for (const r of rows) {
    try { made += await ensureVariants(String(r.storage_path)) } catch (e: any) { console.warn('[miniatures] ignoré :', e?.message || e) }
  }
  console.log(`[miniatures] ${rows.length} image(s) vérifiée(s), ${made} miniature(s) créée(s)`)
}
