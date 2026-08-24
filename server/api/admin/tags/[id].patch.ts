// PATCH /api/admin/tags/:id — renommer un tag (propagé aux produits)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const newName = String(body?.name || '').trim()
  if (!id || !newName) throw createError({ statusCode: 400, statusMessage: 'Paramètres invalides' })

  const old = await query('SELECT name FROM tags WHERE id = $1', [id])
  if (!old.rowCount) throw createError({ statusCode: 404, statusMessage: 'Tag introuvable' })
  const oldName = old.rows[0].name

  await query('UPDATE tags SET name = $1 WHERE id = $2', [newName, id])
  await query('UPDATE products SET tags = array_replace(tags, $1, $2) WHERE $1 = ANY(tags)', [oldName, newName])
  return { id, name: newName }
})
