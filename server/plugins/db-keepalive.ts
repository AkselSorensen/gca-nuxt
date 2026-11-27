// Garde des connexions chaudes vers la base distante : sans ça, la première requête après quelques
// secondes d'inactivité paie une nouvelle connexion SSL (plusieurs centaines de ms).
import { pool } from '../services/db'

export default defineNitroPlugin(() => {
  const ping = () => Promise.all([pool.query('SELECT 1'), pool.query('SELECT 1')]).catch(() => {})
  ping()
  setInterval(ping, 20_000).unref()
})
