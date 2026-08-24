// DELETE /api/admin/products/:productId/files/:fileId — suppression fichier + R2 (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../../utils/auth'
import { query } from '../../../../../services/db'
import { r2Client, DeleteObjectCommand, R2_BUCKET } from '../../../../../services/r2'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const fileId = Number(getRouterParam(event, 'fileId'))

  try {
    const file = await query('SELECT storage_path FROM product_files WHERE id = $1', [fileId])
    if (!file.rowCount) throw createError({ statusCode: 404, statusMessage: 'File not found' })
    if (r2Client) {
      try {
        await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: file.rows[0].storage_path }))
      } catch (r2Err: any) {
        console.error('R2 delete error:', r2Err)
      }
    }
    await query('DELETE FROM product_files WHERE id = $1', [fileId])
    return { ok: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin delete file error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to delete file' })
  }
})
