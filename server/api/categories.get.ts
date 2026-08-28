// GET /api/categories — liste des catégories (réplique du monolithe Express)
import { defineEventHandler, createError, setResponseHeader } from 'h3'
import { query } from '../services/db'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=600')
  try {
    const result = await query(
      `
        SELECT
          c.id,
          c.name,
          c.slug,
          c.description,
          COUNT(p.id)::int AS product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.name ASC
      `
    )
    return result.rows
  } catch (error) {
    console.error('Categories error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch categories' })
  }
})
