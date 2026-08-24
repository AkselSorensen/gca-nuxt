// Service : R2 (Cloudflare) — client + presigner (réplique du monolithe)
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

export { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, R2_BUCKET }

export async function r2SignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(r2Client!, new GetObjectCommand({ Bucket: R2_BUCKET, Key: storagePath }), { expiresIn })
}
