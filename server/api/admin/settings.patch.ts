// PATCH /api/admin/settings — mode maintenance (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const { maintenanceMode } = body
  if (maintenanceMode === undefined) throw createError({ statusCode: 400, statusMessage: 'maintenanceMode is required' })

  try {
    await query("UPDATE settings SET value = $1 WHERE key = 'maintenance_mode'", [maintenanceMode ? 'true' : 'false'])
    return { ok: true, maintenanceMode: Boolean(maintenanceMode) }
  } catch (error: any) {
    console.error('Settings update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update settings' })
  }
})
