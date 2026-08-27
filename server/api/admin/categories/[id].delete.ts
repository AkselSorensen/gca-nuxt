// DELETE /api/admin/categories/:id — suppression
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  if (!admin) throw createError({ statusCode: 401, message: 'Non autorisé' })
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'ID invalide' })
  // Bloque si des produits y sont rattachés
  const p = await query('SELECT COUNT(*)::int AS c FROM products WHERE category_id = $1', [id])
  if (p.rows[0].c > 0) throw createError({ statusCode: 400, message: `Impossible : ${p.rows[0].c} produit(s) rattaché(s) à cette catégorie` })
  const r = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id])
  if (!r.rowCount) throw createError({ statusCode: 404, message: 'Catégorie introuvable' })
  return { ok: true }
})
