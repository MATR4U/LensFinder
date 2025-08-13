#!/usr/bin/env ts-node
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import pg from 'pg';

async function main() {
  const moduleDir = path.dirname(new URL(import.meta.url).pathname);
  const monoRoot = path.resolve(moduleDir, '..');
  const envPath = path.join(monoRoot, '.env');
  const loaded = dotenv.config({ path: envPath });
  if (loaded.error) {
    throw new Error('Missing required env file .env at repo root.');
  }

  const hasExplicitPgParams = !!(process.env.POSTGRES_HOST || process.env.POSTGRES_PORT || process.env.POSTGRES_USER || process.env.POSTGRES_PASSWORD || process.env.POSTGRES_DB);
  const databaseUrl = hasExplicitPgParams
    ? (() => {
        const host = process.env.POSTGRES_HOST || 'localhost';
        const port = process.env.POSTGRES_PORT || '5432';
        const user = process.env.POSTGRES_USER || 'lens';
        const password = process.env.POSTGRES_PASSWORD || 'lens';
        const db = process.env.POSTGRES_DB || 'lensfinder';
        return `postgres://${user}:${password}@${host}:${port}/${db}`;
      })()
    : ((process.env.DATABASE_URL && process.env.DATABASE_URL.trim())
        ? process.env.DATABASE_URL
        : (process.env.NODE_ENV === 'production'
            ? (() => { throw new Error('DATABASE_URL is required in production'); })()
            : (() => {
                const host = 'localhost';
                const port = '5432';
                const user = 'lens';
                const password = 'lens';
                const db = 'lensfinder';
                return `postgres://${user}:${password}@${host}:${port}/${db}`;
              })()
          )
      );
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const schemaPath = path.resolve(moduleDir, 'sql', 'schema.sql');
    const ddl = await fs.readFile(schemaPath, 'utf-8');
    await client.query(ddl);

    const root = path.resolve(path.dirname(new URL(import.meta.url).pathname));
    const camerasPath = path.join(root, 'data', 'cameras.json');
    const lensesPath = path.join(root, 'data', 'lenses.json');

    // Load cameras
    const camRaw = await fs.readFile(camerasPath, 'utf-8');
    const cameras = JSON.parse(camRaw) as any[];
    for (const c of cameras) {
      await client.query(
        `INSERT INTO cameras(name, brand, mount, sensor_name, sensor_width_mm, sensor_height_mm, sensor_coc_mm, sensor_crop, ibis, price_chf, weight_g, source_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (name) DO UPDATE SET brand=EXCLUDED.brand, mount=EXCLUDED.mount, sensor_name=EXCLUDED.sensor_name,
           sensor_width_mm=EXCLUDED.sensor_width_mm, sensor_height_mm=EXCLUDED.sensor_height_mm, sensor_coc_mm=EXCLUDED.sensor_coc_mm,
           sensor_crop=EXCLUDED.sensor_crop, ibis=EXCLUDED.ibis, price_chf=EXCLUDED.price_chf, weight_g=EXCLUDED.weight_g, source_url=EXCLUDED.source_url`,
        [
          c.name,
          c.brand,
          c.mount,
          c.sensor?.name ?? null,
          c.sensor?.width_mm ?? null,
          c.sensor?.height_mm ?? null,
          c.sensor?.coc_mm ?? null,
          c.sensor?.crop ?? null,
          !!c.ibis,
          c.price_chf ?? null,
          c.weight_g ?? null,
          c.source_url ?? null
        ]
      );
    }

    // Load lenses
    const lenRaw = await fs.readFile(lensesPath, 'utf-8');
    const lenses = JSON.parse(lenRaw) as any[];
    for (const l of lenses) {
      await client.query(
        `INSERT INTO lenses(name, brand, mount, coverage, focal_min_mm, focal_max_mm, aperture_min, aperture_max,
          weight_g, ois, price_chf, weather_sealed, is_macro, distortion_pct, focus_breathing_score, source_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
         ON CONFLICT (name, brand, mount) DO UPDATE SET coverage=EXCLUDED.coverage, focal_min_mm=EXCLUDED.focal_min_mm,
           focal_max_mm=EXCLUDED.focal_max_mm, aperture_min=EXCLUDED.aperture_min, aperture_max=EXCLUDED.aperture_max,
           weight_g=EXCLUDED.weight_g, ois=EXCLUDED.ois, price_chf=EXCLUDED.price_chf, weather_sealed=EXCLUDED.weather_sealed,
           is_macro=EXCLUDED.is_macro, distortion_pct=EXCLUDED.distortion_pct, focus_breathing_score=EXCLUDED.focus_breathing_score,
           source_url=EXCLUDED.source_url`,
        [
          l.name, l.brand, l.mount, l.coverage, l.focal_min_mm ?? null, l.focal_max_mm ?? null, l.aperture_min ?? null, l.aperture_max ?? null,
          l.weight_g ?? null, !!l.ois, l.price_chf ?? null, !!l.weather_sealed, !!l.is_macro, l.distortion_pct ?? null, l.focus_breathing_score ?? null, l.source_url ?? null
        ]
      );
    }

    await client.query('COMMIT');
    console.log(`Migration complete: ${cameras.length} cameras, ${lenses.length} lenses.`);
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Migration failed', e);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();


