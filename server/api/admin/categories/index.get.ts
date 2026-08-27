// GET /api/admin/categories — liste des catégories
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  if (!admin) throw createError({ statusCode: 401, message: 'Non autorisé' })
  const r = await query('SELECT id, name, slug, description, sort_order AS "sortOrder" FROM categories ORDER BY sort_order ASC, name ASC')
  return { categories: r.rows }
})
