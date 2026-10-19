import { defineEventHandler } from 'h3'
import { query } from '../services/db'

const DEFAULT_MESSAGE = 'Le site est temporairement indisponible afin d’effectuer quelques améliorations. Merci de votre patience.'

export default defineEventHandler(async () => {
  try {
    const result = await query("SELECT key, value FROM settings WHERE key IN ('maintenance_mode', 'maintenance_message')")
    const values = Object.fromEntries(result.rows.map((row: { key: string; value: string }) => [row.key, row.value]))
    return {
      maintenanceMode: values.maintenance_mode === 'true',
      maintenanceMessage: values.maintenance_message || DEFAULT_MESSAGE,
    }
  } catch (error) {
    console.error('Maintenance status error:', error)
    return { maintenanceMode: false, maintenanceMessage: DEFAULT_MESSAGE }
  }
})
