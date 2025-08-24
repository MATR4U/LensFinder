import type { Pool as PoolType } from 'pg'
import pg from 'pg'
const { Pool: PoolCtor } = pg

let pool: PoolType | null = null

export function getPool(): PoolType {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || ''
    pool = new PoolCtor({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000
    }) as unknown as PoolType
  }
  return pool
}
