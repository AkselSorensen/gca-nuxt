// GET /api/admin/users — liste des utilisateurs (réplique du monolithe)
import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '../../utils/auth'
import { query } from '../../services/db'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const result = await query(
      'SELECT id, email, display_name, role, avatar_url, discord_id, steam_id, commission_percent, created_at FROM users ORDER BY created_at DESC'
    )
    return result.rows.map((r: any) => ({
      id: r.id,
      email: r.email,
      displayName: r.display_name,
      role: r.role,
      avatarUrl: r.avatar_url,
      discordId: r.discord_id,
      steamId: r.steam_id,
      commissionPercent: Number(r.commission_percent),
      createdAt: r.created_at,
    }))
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('Admin users error:', error)
    throw createError({ statusCode: 500, statusMessage: 'Unable to fetch users' })
  }
})
