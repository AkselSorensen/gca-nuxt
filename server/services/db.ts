// Service : connexion PostgreSQL partagée (Supabase).
// Les modules migrés hors du monolithe Express utilisent ce pool.
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function query(text: string, params: any[] = []) {
  return pool.query(text, params)
}
