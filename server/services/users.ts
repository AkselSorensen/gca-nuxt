// Service : helpers utilisateurs (identiques au monolithe Express —
// hashPassword doit rester byte-identique pour la compatibilité des mots de passe).
import { createHash } from 'node:crypto'

export function hashPassword(password: string): string {
  return createHash('sha256').update(String(password)).digest('hex')
}

export function slugify(value: string): string {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function sanitizeUser(row: any) {
  if (!row) return null
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    slug: row.slug,
    role: row.role,
    avatarUrl: row.avatar_url,
    preferredLanguage: row.preferred_language,
    discordId: row.discord_id || null,
    steamId: row.steam_id || null,
    stripeAccountId: row.stripe_account_id || null,
    createdAt: row.created_at,
  }
}
