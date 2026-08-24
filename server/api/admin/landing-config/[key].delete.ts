// DELETE /api/admin/landing-config/:key — suppression config landing (réplique du monolithe)
import { defineEventHandler, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sectionKey = String(getRouterParam(event, 'key'))

  try {
    await query('DELETE FROM admin_landing_config WHERE section_key = $1', [sectionKey])
    return { ok: true, deleted: true }
  } catch (error: any) {
    console.error('Landing config delete error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to delete landing config' })
  }
})
