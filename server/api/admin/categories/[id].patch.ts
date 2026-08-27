// PATCH /api/admin/categories/:id — renommage / description
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  if (!admin) throw createError({ statusCode: 401, message: 'Non autorisé' })
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'ID invalide' })
  const body = await readBody(event).catch(() => ({}))
  const updates: string[] = []
  const values: any[] = []
  let idx = 1
  if (body?.name !== undefined) { updates.push(`name = $${idx++}`); values.push(String(body.name).trim()) }
  if (body?.description !== undefined) { updates.push(`description = $${idx++}`); values.push(String(body.description).trim().slice(0, 200)) }
  if (body?.sortOrder !== undefined) { updates.push(`sort_order = $${idx++}`); values.push(Number(body.sortOrder)) }
  if (!updates.length) throw createError({ statusCode: 400, message: 'Rien à modifier' })
  values.push(id)
  const r = await query(`UPDATE categories SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, slug, description, sort_order AS "sortOrder"`, values)
  if (!r.rowCount) throw createError({ statusCode: 404, message: 'Catégorie introuvable' })
  return { category: r.rows[0] }
})
