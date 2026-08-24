// GET /api/page-content/:page — contenu public des pages (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  try {
    const page = String(getRouterParam(event, 'page') || '').slice(0, 40)
    const allowedPages = ['prestation', 'about', 'footer']
    if (!allowedPages.includes(page)) {
      throw createError({ statusCode: 404, statusMessage: 'Unknown page' })
    }
    const result = await query('SELECT value FROM settings WHERE key = $1', [`page_content_${page}`])
    if (result.rowCount) {
      try {
        return JSON.parse(result.rows[0].value)
      } catch {
        return {}
      }
    }
    return {}
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Page content get error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to load page content' })
  }
})
