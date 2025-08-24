import { Pool } from 'pg'

let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || ''
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000
    })
  }
  return pool
}
