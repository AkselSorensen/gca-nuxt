// PATCH /api/admin/landing-config/:key — config landing (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { query } from '../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sectionKey = String(getRouterParam(event, 'key'))
  const body = await readBody(event)
  const { isActive, title, description, metadata } = body

  try {
    const updates: string[] = []
    const values: any[] = []
    let idx = 1

    if (isActive !== undefined) { updates.push(`is_active = $${idx++}`); values.push(Boolean(isActive)) }
    if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(String(title)) }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(String(description)) }
    if (metadata !== undefined) { updates.push(`metadata = $${idx++}`); values.push(metadata && typeof metadata === 'object' ? metadata : {}) }

    if (!updates.length) throw createError({ statusCode: 400, statusMessage: 'Nothing to update' })

    values.push(sectionKey)

    const existing = await query('SELECT id FROM admin_landing_config WHERE section_key = $1', [sectionKey])

    if (!existing.rowCount) {
      await query(
        'INSERT INTO admin_landing_config (section_key, is_active, title, description) VALUES ($1, $2, $3, $4)',
        [sectionKey, isActive !== undefined ? Boolean(isActive) : true, title || sectionKey, description || '']
      )
      if (metadata !== undefined) {
        await query(
          'UPDATE admin_landing_config SET metadata = $1 WHERE section_key = $2',
          [metadata && typeof metadata === 'object' ? metadata : {}, sectionKey]
        )
      }
    } else {
      await query(`UPDATE admin_landing_config SET ${updates.join(', ')} WHERE section_key = $${idx}`, values)
    }

    return { ok: true }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Landing config update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update landing config' })
  }
})
