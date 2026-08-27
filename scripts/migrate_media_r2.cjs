#!/usr/bin/env node
/**
 * Migre les images base64 stockées en DB vers R2 (Cloudflare).
 * - Lit les rows product_media avec url LIKE 'data:%'
 * - Upload vers R2 (products/<id>/images/<ts>.<ext>)
 * - Réécrit url + thumbnail_url → /api/media/:id, remplit storage_path
 * Usage: node scripts/migrate_media_r2.js
 */
require('dotenv').config()
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { Pool } = require('pg')

const R2_ENDPOINT = process.env.R2_ENDPOINT || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET = process.env.R2_BUCKET || 'gca-files'

async function main() {
  if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    console.error('R2 non configuré dans .env')
    process.exit(1)
  }
  const client = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
  })
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

  const { rows } = await pool.query(
    `SELECT id, product_id, url, thumbnail_url, media_type FROM product_media WHERE url LIKE 'data:%' ORDER BY id`
  )
  console.log(`Images base64 à migrer : ${rows.length}`)

  for (const row of rows) {
    const match = String(row.url).match(/^data:([^;,]+);base64,(.*)$/s)
    if (!match) {
      console.log(`  media ${row.id} : url data invalide, ignoré`)
      continue
    }
    const mime = match[1]
    const buffer = Buffer.from(match[2], 'base64')
    const ext = mime.split('/')[1]?.replace('jpeg', 'jpg') || 'jpg'
    const key = `products/${row.product_id}/images/${Date.now()}-${row.id}.${ext}`

    await client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: buffer, ContentType: mime }))

    // L'URL publique devient /api/media/<id> (proxy R2 avec cache 7j)
    const url = `/api/media/${row.id}`
    await pool.query(
      `UPDATE product_media SET url = $1, thumbnail_url = $2, storage_path = $3, media_type = 'image' WHERE id = $4`,
      [url, url, key, row.id]
    )
    console.log(`  media ${row.id} → R2 [${key}] (${(buffer.length / 1024).toFixed(0)} Ko) ✓`)
  }

  await pool.end()
  console.log('Migration terminée.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
