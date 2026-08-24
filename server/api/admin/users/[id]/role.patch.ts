// PATCH /api/admin/users/:id/role — rôle utilisateur (réplique du monolithe)
import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import { requireAdmin } from '../../../../utils/auth'
import { query } from '../../../../services/db'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const userId = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const { role } = body
  const allowedRoles = ['customer', 'seller', 'admin']
  if (Number.isNaN(userId) || !allowedRoles.includes(role)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id or role' })
  }

  try {
    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, display_name, role',
      [role, userId]
    )
    if (!result.rowCount) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    return { ok: true, user: result.rows[0] }
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin role update error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to update role' })
  }
})
