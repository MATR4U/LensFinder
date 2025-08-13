import pg from 'pg';
import type { Pool } from 'pg';
import request from 'supertest';
import express from 'express';

function getBaseDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
  if (envUrl) return envUrl;
  return 'postgres://lens:lens@localhost:5432/lensfinder';
}

function withSearchPath(url: string, searchPath: string): string {
  const hasQuery = url.includes('?');
  const param = 'options=' + encodeURIComponent(`-c search_path=${searchPath}`);
  return url + (hasQuery ? '&' : '?') + param;
}

let adminPool: Pool;
let app: express.Express;
let skipSuite = (process.env.SKIP_DB_TESTS === 'true' || process.env.SKIP_DB_TESTS === '1');

const TEST_SCHEMA_BASE = 'lf_test';
const TS = Date.now();
const TEST_SCHEMA = `${TEST_SCHEMA_BASE}_${TS}`;

beforeAll(async () => {
  if (skipSuite) return;
  // Create test schema and tables with seed rows using admin connection
  adminPool = new pg.Pool({ connectionString: getBaseDatabaseUrl(), connectionTimeoutMillis: 500 });
  let client: pg.PoolClient | null = null;
  try {
    client = await adminPool.connect();
    await client.query('BEGIN');
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${TEST_SCHEMA}`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TEST_SCHEMA}.cameras (
        id serial PRIMARY KEY,
        name text UNIQUE,
        brand text,
        mount text,
        sensor_name text,
        sensor_width_mm numeric,
        sensor_height_mm numeric,
        sensor_coc_mm numeric,
        sensor_crop numeric,
        ibis boolean,
        price_chf numeric,
        weight_g numeric,
        source_url text
      )`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${TEST_SCHEMA}.lenses (
        id serial PRIMARY KEY,
        name text,
        brand text,
        mount text,
        coverage text,
        focal_min_mm numeric,
        focal_max_mm numeric,
        aperture_min numeric,
        aperture_max numeric,
        weight_g numeric,
        ois boolean,
        price_chf numeric,
        weather_sealed boolean,
        is_macro boolean,
        distortion_pct numeric,
        focus_breathing_score numeric,
        source_url text,
        UNIQUE(name, brand, mount)
      )`);
    await client.query(`TRUNCATE ${TEST_SCHEMA}.cameras RESTART IDENTITY`);
    await client.query(`TRUNCATE ${TEST_SCHEMA}.lenses RESTART IDENTITY`);
    await client.query(
      `INSERT INTO ${TEST_SCHEMA}.cameras(name, brand, mount, sensor_name, sensor_width_mm, sensor_height_mm, sensor_coc_mm, sensor_crop, ibis, price_chf, weight_g, source_url)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (name) DO NOTHING`,
      ['Alpha 7 IV', 'Sony', 'E', 'Full Frame', 36, 24, 0.03, 1.0, true, 2499, 659, 'https://example.com/a7iv']
    );
    await client.query(
      `INSERT INTO ${TEST_SCHEMA}.lenses(name, brand, mount, coverage, focal_min_mm, focal_max_mm, aperture_min, aperture_max,
        weight_g, ois, price_chf, weather_sealed, is_macro, distortion_pct, focus_breathing_score, source_url)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (name, brand, mount) DO NOTHING`,
      ['FE 24-70mm F2.8 GM', 'Sony', 'E', 'FF', 24, 70, 2.8, 22, 886, false, 2199, true, false, 1.2, 8.5, 'https://example.com/24-70gm']
    );
    await client.query('COMMIT');
  } catch (e) {
    try { await client?.query('ROLLBACK'); } catch {}
    // If DB is not available, mark suite to be skipped
    skipSuite = true;
    return;
  } finally {
    client?.release();
  }

  // Point the app's pool to the test schema via search_path
  process.env.DATABASE_URL = withSearchPath(getBaseDatabaseUrl(), `${TEST_SCHEMA},public`);

  const { createRouter } = await import('../router.js');
  app = express();
  app.use(express.json());
  app.use(createRouter({ rootDir: process.cwd() }));
});

afterAll(async () => {
  if (skipSuite || !adminPool) return;
  const client = await adminPool.connect();
  try {
    await client.query('BEGIN');
    // Prune old test schemas beyond 10
    const { rows } = await client.query(
      `select nspname from pg_namespace where nspname like $1 order by nspname`,
      [`${TEST_SCHEMA_BASE}_%`]
    );
    const schemas = rows.map((r: any) => r.nspname);
    if (schemas.length > 10) {
      const toDelete = schemas.slice(0, schemas.length - 10);
      for (const s of toDelete) {
        await client.query(`DROP SCHEMA IF EXISTS ${s} CASCADE`);
      }
    }
    await client.query(`DROP SCHEMA IF EXISTS ${TEST_SCHEMA} CASCADE`);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
    await adminPool.end();
  }
});

const suite = skipSuite ? describe.skip : describe;
suite('API endpoints (db-backed test schema)', () => {
  it('GET /api/cameras returns seeded data from test schema', async () => {
    if (skipSuite) { return; }
    const res = await request(app).get('/api/cameras');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((c: any) => c.name === 'Alpha 7 IV')).toBeTruthy();
  });

  it('GET /api/lenses returns seeded data from test schema', async () => {
    if (skipSuite) { return; }
    const res = await request(app).get('/api/lenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find((l: any) => l.name === 'FE 24-70mm F2.8 GM')).toBeTruthy();
  });
});


