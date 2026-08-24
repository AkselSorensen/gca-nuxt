// GET /api/admin/tags — liste des tags (id + nom)
import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const r = await query('SELECT id, name FROM tags ORDER BY name')
  return { tags: r.rows }
})
