// GET /api/download/:orderItemId — signed URLs R2 (1h) pour télécharger (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireUser } from '../../utils/auth'
import { query } from '../../services/db'
import { r2Client, r2SignedUrl } from '../../services/r2'

export default defineEventHandler(async (event) => {
  try {
    const user = await requireUser(event)
    if (!r2Client) {
      throw createError({ statusCode: 503, statusMessage: 'R2 storage non configuré (manque R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)' })
    }

    const orderItemId = Number(getRouterParam(event, 'orderItemId'))
    if (!orderItemId) throw createError({ statusCode: 400, statusMessage: 'orderItemId invalide' })

    // Vérifier que l'utilisateur possède bien ce produit
    const item = await query(
      `SELECT oi.id, oi.product_id, oi.download_count, o.user_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.id = $1 AND o.user_id = $2`,
      [orderItemId, user.id]
    )
    if (!item.rowCount) {
      throw createError({ statusCode: 403, statusMessage: 'Vous ne possédez pas ce produit' })
    }

    // Vérifier qu'il y a un fichier associé
    const files = await query(
      `SELECT id, filename, file_size, storage_path
       FROM product_files
       WHERE product_id = $1
       ORDER BY sort_order ASC, is_main DESC`,
      [item.rows[0].product_id]
    )
    if (!files.rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Aucun fichier disponible pour ce produit' })
    }

    // Incrémenter le compteur de downloads
    await query('UPDATE order_items SET download_count = download_count + 1 WHERE id = $1', [orderItemId])

    // Générer une signed URL pour chaque fichier (1h)
    const signedUrls = await Promise.all(
      files.rows.map(async (f: any) => ({
        filename: f.filename,
        file_size: f.file_size,
        url: await r2SignedUrl(f.storage_path, 3600),
      }))
    )

    return { files: signedUrls }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Download error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la génération du lien de téléchargement' })
  }
})
