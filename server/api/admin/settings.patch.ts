// PATCH /api/admin/settings - mode maintenance (réplique du monolithe)
import { defineEventHandler, readBody, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const { maintenanceMode, maintenanceMessage } = body || {}
  if (maintenanceMode === undefined && maintenanceMessage === undefined) throw createError({ statusCode: 400, statusMessage: 'A maintenance setting is required' })
  if (maintenanceMessage !== undefined && typeof maintenanceMessage !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'maintenanceMessage must be a string' })
  }

  try {
    if (maintenanceMode !== undefined) {
      await query(
        `INSERT INTO settings (key, value) VALUES ('maintenance_mode', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [maintenanceMode ? 'true' : 'false']
      )
    }
    if (maintenanceMessage !== undefined) {
      await query(
        `INSERT INTO settings (key, value) VALUES ('maintenance_message', $1)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [maintenanceMessage.slice(0, 300)]
      )
    }
    return { ok: true, maintenanceMode: Boolean(maintenanceMode), maintenanceMessage: maintenanceMessage?.slice(0, 300) }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Settings update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update settings' })
  }
})
