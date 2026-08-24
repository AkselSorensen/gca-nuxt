// GET /api/admin/settings — maintenance + landing config (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const result = await query("SELECT value FROM settings WHERE key = 'maintenance_mode'")
    const landingConfig = await query('SELECT * FROM admin_landing_config ORDER BY id ASC')
    return {
      maintenanceMode: result.rows[0]?.value === 'true',
      landingConfig: landingConfig.rows,
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Settings fetch error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch settings' })
  }
})
