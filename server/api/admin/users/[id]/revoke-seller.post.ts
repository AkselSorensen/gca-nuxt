// POST /api/admin/users/:id/revoke-seller — révoque le rôle vendeur d'un compte.
// Le compte redevient client (role='customer', seller_status='revoked') et ses produits
// sont masqués du catalogue : un vendeur révoqué ne doit plus vendre.
// Les commandes passées et les taux de commission historiques ne sont PAS touchés.
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'
import { purgeRouteCache } from '../../../../utils/cache'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  if (Number.isNaN(userId)) throw createError({ statusCode: 400, statusMessage: 'Identifiant invalide' })

  try {
    const target = await query('SELECT id, email, display_name, role FROM users WHERE id = $1', [userId])
    if (!target.rowCount) throw createError({ statusCode: 404, statusMessage: 'Utilisateur introuvable' })
    if (target.rows[0].role === 'admin') {
      throw createError({ statusCode: 400, statusMessage: "Impossible de révoquer un administrateur." })
    }

    const updated = await query(
      `UPDATE users SET role = 'customer', seller_status = 'revoked' WHERE id = $1
       RETURNING id, email, display_name, role, seller_status`,
      [userId]
    )
    const hidden = await query(
      'UPDATE products SET is_hidden = TRUE WHERE seller_id = $1 AND is_hidden = FALSE RETURNING id',
      [userId]
    )
    await purgeRouteCache()
    console.log(`[admin] rôle vendeur révoqué pour ${userId} — ${hidden.rowCount} produit(s) masqué(s)`)
    return { ok: true, user: updated.rows[0], hiddenProducts: hidden.rowCount }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin revoke seller error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Révocation impossible' })
  }
})
