// POST /api/admin/categories — création d'une catégorie
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

const slugify = (s: string) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  if (!admin) throw createError({ statusCode: 401, message: 'Non autorisé' })
  const body = await readBody(event).catch(() => ({}))
  const name = String(body?.name || '').trim()
  if (!name) throw createError({ statusCode: 400, message: 'Le nom de la catégorie est requis' })
  const slug = body?.slug ? String(body.slug).trim() : slugify(name)
  if (!slug) throw createError({ statusCode: 400, message: 'Slug invalide' })
  const description = String(body?.description || '').trim().slice(0, 200)
  const sortOrder = Number(body?.sortOrder || 0)

  const dup = await query('SELECT id FROM categories WHERE slug = $1', [slug])
  if (dup.rowCount) throw createError({ statusCode: 400, message: 'Une catégorie avec ce slug existe déjà' })

  const r = await query(
    'INSERT INTO categories (name, slug, description, sort_order) VALUES ($1, $2, $3, $4) RETURNING id, name, slug, description, sort_order AS "sortOrder"',
    [name, slug, description, sortOrder]
  )
  return { category: r.rows[0] }
})
