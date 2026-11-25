// GET /api/admin/settings - maintenance + landing config (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const result = await query("SELECT key, value FROM settings WHERE key IN ('maintenance_mode', 'maintenance_message')")
    const settings = Object.fromEntries(result.rows.map((row: { key: string; value: string }) => [row.key, row.value]))
    const landingConfig = await query('SELECT * FROM admin_landing_config ORDER BY id ASC')
    return {
      maintenanceMode: settings.maintenance_mode === 'true',
      maintenanceMessage: settings.maintenance_message || 'Le site est temporairement indisponible afin d’effectuer quelques améliorations. Merci de votre patience.',
      landingConfig: landingConfig.rows,
    }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Settings fetch error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch settings' })
  }
})
