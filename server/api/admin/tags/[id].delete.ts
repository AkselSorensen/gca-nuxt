// DELETE /api/admin/tags/:id — supprimer un tag (retiré des produits)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })

  const old = await query('SELECT name FROM tags WHERE id = $1', [id])
  if (!old.rowCount) throw createError({ statusCode: 404, statusMessage: 'Tag introuvable' })

  await query('DELETE FROM tags WHERE id = $1', [id])
  await query('UPDATE products SET tags = array_remove(tags, $1) WHERE $1 = ANY(tags)', [old.rows[0].name])
  return { ok: true }
})
