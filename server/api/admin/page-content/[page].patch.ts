// PATCH /api/admin/page-content/:page — sauvegarde du contenu (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const page = String(getRouterParam(event, 'page') || '').slice(0, 40)
    const allowedPages = ['prestation', 'about', 'footer']
    if (!allowedPages.includes(page)) {
      throw createError({ statusCode: 404, statusMessage: 'Unknown page' })
    }

    const content = await readBody(event)
    if (!content || typeof content !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'Content object is required' })
    }

    const key = `page_content_${page}`
    await query(
      `INSERT INTO settings (key, value) VALUES ($1, $2)
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
      [key, JSON.stringify(content)]
    )

    return { ok: true, page, saved: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Page content save error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to save page content' })
  }
})
