import pg from 'pg';
import type { Pool as PgPool } from 'pg';
import { config } from '../config.js';

let pool: PgPool | null = null;

export function getPool(): PgPool {
  if (!pool) {
    const connectionString = config.databaseUrl;
    pool = new pg.Pool({ connectionString });
  }
  return pool;
}

export async function pgFindAllCameras(limit?: number, offset?: number) {
  const clauses: string[] = [];
  const params: any[] = [];
  if (typeof limit === 'number' && Number.isFinite(limit)) {
    params.push(Math.max(0, Math.floor(limit)));
    clauses.push(`LIMIT $${params.length}`);
  }
  if (typeof offset === 'number' && Number.isFinite(offset)) {
    params.push(Math.max(0, Math.floor(offset)));
    clauses.push(`OFFSET $${params.length}`);
  }
  const sql = `
    SELECT id, name, brand, mount,
           sensor_name, sensor_width_mm, sensor_height_mm, sensor_coc_mm, sensor_crop,
           ibis, price_chf, weight_g, source_url
      FROM cameras
     ORDER BY brand, name
     ${clauses.join(' ')}`;
  const { rows } = await getPool().query(sql, params);
  return rows;
}

export async function pgFindAllLenses(limit?: number, offset?: number) {
  const clauses: string[] = [];
  const params: any[] = [];
  if (typeof limit === 'number' && Number.isFinite(limit)) {
    params.push(Math.max(0, Math.floor(limit)));
    clauses.push(`LIMIT $${params.length}`);
  }
  if (typeof offset === 'number' && Number.isFinite(offset)) {
    params.push(Math.max(0, Math.floor(offset)));
    clauses.push(`OFFSET $${params.length}`);
  }
  const sql = `
    SELECT id, name, brand, mount, coverage,
           focal_min_mm, focal_max_mm, aperture_min, aperture_max,
           weight_g, ois, price_chf, weather_sealed, is_macro,
           distortion_pct, focus_breathing_score, source_url
      FROM lenses
     ORDER BY brand, name, mount
     ${clauses.join(' ')}`;
  const { rows } = await getPool().query(sql, params);
  return rows;
}

export async function pgCountCameras() {
  const { rows } = await getPool().query(`SELECT COUNT(*)::int AS count FROM cameras`);
  return rows[0]?.count as number;
}

export async function pgCountLenses() {
  const { rows } = await getPool().query(`SELECT COUNT(*)::int AS count FROM lenses`);
  return rows[0]?.count as number;
}

export async function pgIdemGet(key: string) {
  const { rows } = await getPool().query(`SELECT response FROM idempotency_keys WHERE key=$1`, [key]);
  return rows[0]?.response;
}

export async function pgIdemSet(key: string, response: any) {
  await getPool().query(
    `INSERT INTO idempotency_keys(key, response, created_at)
     VALUES($1, $2, now())
     ON CONFLICT(key) DO UPDATE SET response=EXCLUDED.response, created_at=now()`,
    [key, response]
  );
}


