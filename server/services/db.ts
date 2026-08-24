// Service : connexion PostgreSQL partagée (Supabase).
// Les modules migrés hors du monolithe Express utilisent ce pool.
// dotenv : le monolithe Express charge .env lui-même ; on fait pareil ici
// pour que le build standalone (node .output/server/index.mjs) ait DATABASE_URL.
// NB: `import 'dotenv/config'` est tree-shaké par Rollup — appel explicite requis.
import dotenv from 'dotenv'
dotenv.config()
import pg from 'pg'

const { Pool } = pg

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export async function query(text: string, params: any[] = []) {
  return pool.query(text, params)
}
