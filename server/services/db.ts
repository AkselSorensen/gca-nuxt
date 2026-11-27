// Service : connexion PostgreSQL partagée (Supabase).
// Les modules migrés hors du monolithe Express utilisent ce pool.
// dotenv : le monolithe Express charge .env lui-même ; on fait pareil ici
// pour que le build standalone (node .output/server/index.mjs) ait DATABASE_URL.
// NB: `import 'dotenv/config'` est tree-shaké par Rollup - appel explicite requis.
import dotenv from 'dotenv'
dotenv.config()
import pg from 'pg'

const { Pool } = pg

// Base sur le même serveur (conteneur « db ») : pas de SSL. Base distante (Supabase) : SSL.
const dbUrl = process.env.DATABASE_URL || ''
const localDb = /@(db|localhost|127\.0\.0\.1)(:|\/|$)/.test(dbUrl) || /sslmode=disable/.test(dbUrl)

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: localDb ? false : { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 600_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
})

export async function query(text: string, params: any[] = []) {
  return pool.query(text, params)
}
