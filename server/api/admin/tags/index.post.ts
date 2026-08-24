// POST /api/admin/tags — créer un tag
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const name = String(body?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nom de tag requis' })

  const r = await query(
    `INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id, name`,
    [name]
  )
  if (!r.rowCount) throw createError({ statusCode: 409, statusMessage: 'Ce tag existe déjà' })
  return { id: r.rows[0].id, name: r.rows[0].name }
})
