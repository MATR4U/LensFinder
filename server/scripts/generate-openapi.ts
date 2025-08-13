#!/usr/bin/env tsx
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

type Column = {
  column_name: string;
  data_type: string;
  is_nullable: 'YES' | 'NO';
};

function getDatabaseUrl(): string {
  // Load single .env at repo root
  const monoRoot = path.resolve(process.cwd(), '..');
  const envPath = path.join(monoRoot, '.env');
  dotenv.config({ path: envPath });
  const url = process.env.DATABASE_URL && process.env.DATABASE_URL.trim();
  if (!url) throw new Error('DATABASE_URL is required (load from .env).');
  return url;
}

function toOpenApiType(dataType: string): { type: string } {
  const t = dataType.toLowerCase();
  if (t.includes('bool')) return { type: 'boolean' };
  if (t.includes('int') || t.includes('numeric') || t.includes('double') || t.includes('real') || t.includes('decimal')) return { type: 'number' };
  return { type: 'string' };
}

async function readColumns(pool: pg.Pool, table: string): Promise<Column[]> {
  const { rows } = await pool.query(
    `select column_name, data_type, is_nullable from information_schema.columns where table_name = $1 order by ordinal_position`,
    [table]
  );
  return rows as Column[];
}

function buildCameraSchema(cols: Column[]) {
  const sensorPrefix = 'sensor_';
  const cameraProps: Record<string, any> = {};
  const sensorProps: Record<string, any> = {};
  for (const c of cols) {
    if (c.column_name.startsWith(sensorPrefix)) {
      const key = c.column_name.slice(sensorPrefix.length);
      sensorProps[key] = toOpenApiType(c.data_type);
    } else {
      cameraProps[c.column_name] = toOpenApiType(c.data_type);
    }
  }
  // Conform to API mapping in router: sensor fields grouped under `sensor`
  cameraProps.sensor = {
    type: 'object',
    properties: sensorProps,
    additionalProperties: false
  };
  // Include optional HATEOAS links as emitted by the API for v1
  cameraProps._links = { type: 'object', additionalProperties: true };
  // Known top-level boolean columns are normalized to boolean in API
  ['ibis'].forEach((b) => { if (cameraProps[b]) cameraProps[b] = { type: 'boolean' }; });
  return {
    type: 'object',
    properties: cameraProps,
    additionalProperties: false
  };
}

function buildLensSchema(cols: Column[]) {
  const props: Record<string, any> = {};
  for (const c of cols) {
    props[c.column_name] = toOpenApiType(c.data_type);
  }
  ;['ois','weather_sealed','is_macro'].forEach((b) => { if (props[b]) props[b] = { type: 'boolean' }; });
  // Optional HATEOAS links
  props._links = { type: 'object', additionalProperties: true };
  return {
    type: 'object',
    properties: props,
    additionalProperties: false
  };
}

async function main() {
  const pool = new pg.Pool({ connectionString: getDatabaseUrl() });
  try {
    const [cameraCols, lensCols] = await Promise.all([
      readColumns(pool, 'cameras'),
      readColumns(pool, 'lenses')
    ]);

    const cameraItem = buildCameraSchema(cameraCols);
    const lensItem = buildLensSchema(lensCols);

    const openapi: any = {
      openapi: '3.1.0',
      info: { title: 'LensFinder API', version: '1.0.0' },
      paths: {
        '/api': {
          get: {
            summary: 'Service index',
            description: 'Top-level API index with links to entry points and a simple report template description.',
            responses: { '200': { description: 'Index document' } }
          }
        },
        '/api/health': {
          get: {
            summary: 'Health check',
            description: 'Lightweight readiness probe that validates database connectivity.',
            responses: { '200': { description: 'OK' }, '503': { description: 'DB unavailable' } }
          }
        },
        '/api/health/components': {
          get: {
            summary: 'Component health',
            description: 'Reports health for core components: server, database, client (static or dev), GraphQL schema, and OpenAPI presence.',
            responses: {
              '200': {
                description: 'Component health status',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        server: { type: 'object', additionalProperties: true },
                        db: { type: 'object', additionalProperties: true },
                        client: { type: 'object', additionalProperties: true },
                        graphql: { type: 'object', additionalProperties: true },
                        openapi: { type: 'object', additionalProperties: true },
                        meta: { type: 'object', additionalProperties: true }
                      },
                      additionalProperties: false
                    }
                  }
                }
              }
            }
          }
        },
        '/api/cameras': {
          get: {
            summary: 'List cameras',
            description: 'Returns all cameras from the database. Sensor fields are grouped under the sensor object to mirror the REST response.',
            parameters: [
              { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 500 } },
              { name: 'offset', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
              { name: 'x-api-key', in: 'header', required: false, schema: { type: 'string' }, description: 'Required if API_KEY is configured on the server' },
              { name: 'accept', in: 'header', required: false, schema: { type: 'string' }, description: 'Optional versioning header: application/vnd.lensfinder.v1+json' }
            ],
            responses: {
              '200': {
                description: 'Array of cameras',
                headers: {
                  'X-Total-Count': { schema: { type: 'integer' } },
                  'Link': { schema: { type: 'string' }, description: 'RFC5988 pagination links' }
                },
                content: {
                  'application/json': {
                    schema: { type: 'array', items: cameraItem }
                  }
                }
              }
            }
          }
        },
        '/api/lenses': {
          get: {
            summary: 'List lenses',
            description: 'Returns all lenses from the database with normalized boolean fields.',
            parameters: [
              { name: 'limit', in: 'query', required: false, schema: { type: 'integer', minimum: 0, maximum: 500 } },
              { name: 'offset', in: 'query', required: false, schema: { type: 'integer', minimum: 0 } },
              { name: 'x-api-key', in: 'header', required: false, schema: { type: 'string' }, description: 'Required if API_KEY is configured on the server' },
              { name: 'accept', in: 'header', required: false, schema: { type: 'string' }, description: 'Optional versioning header: application/vnd.lensfinder.v1+json' }
            ],
            responses: {
              '200': {
                description: 'Array of lenses',
                headers: {
                  'X-Total-Count': { schema: { type: 'integer' } },
                  'Link': { schema: { type: 'string' }, description: 'RFC5988 pagination links' }
                },
                content: {
                  'application/json': {
                    schema: { type: 'array', items: lensItem }
                  }
                }
              }
            }
          }
        },
        '/api/cache/purge': {
          post: {
            summary: 'Purge cache keys by prefixes',
            description: 'Deletes cached responses by key prefix. Requires HMAC signature when REQUEST_SIGNATURE_SECRET is set.',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { type: 'object', properties: { prefixes: { type: 'array', items: { type: 'string' }, minItems: 1 } }, required: ['prefixes'] } } }
            },
            responses: { '200': { description: 'Purge outcome' }, '401': { description: 'Unauthorized' }, '400': { description: 'Invalid request' } }
          }
        },
        '/api/admin/cache/purge': {
          post: {
            summary: 'Admin purge by prefix',
            description: 'Deletes cache keys by single prefix. Authorized via API key or HMAC signature.',
            requestBody: {
              required: true,
              content: { 'application/json': { schema: { type: 'object', properties: { prefix: { type: 'string' } }, required: ['prefix'] } } }
            },
            responses: { '200': { description: 'Purge outcome' }, '401': { description: 'Unauthorized' }, '400': { description: 'Invalid request' } }
          }
        },
        '/api/events': {
          get: {
            summary: 'Server-sent events (SSE)',
            description: 'Stream server events (Content-Type: text/event-stream). Emits periodic ping and report notifications. When REQUEST_SIGNATURE_SECRET is set, requires signed query parameters ts and sig.',
            responses: { '200': { description: 'SSE stream' } }
          }
        },
        '/api/events/token': {
          get: {
            summary: 'Mint SSE signed token',
            description: 'Returns a signed token { ts, sig } for connecting to /api/events when signatures are enabled. Returns 204 when signatures are disabled.',
            responses: {
              '200': {
                description: 'JSON with ts and sig',
                content: { 'application/json': { schema: { type: 'object', properties: { ts: { type: 'integer' }, sig: { type: 'string' } }, required: ['ts','sig'] } } }
              },
              '204': { description: 'Signatures disabled' }
            }
          }
        },
        '/api/price': {
          get: {
            summary: 'Scrape price from URL',
            description: 'Fetches a page and extracts a price candidate using simple selectors. Enforces optional allowlist and size/time limits.',
            parameters: [
              { name: 'url', in: 'query', required: true, schema: { type: 'string', format: 'uri' } },
              { name: 'x-api-key', in: 'header', required: false, schema: { type: 'string' }, description: 'Required if API_KEY is configured on the server' }
            ],
            responses: {
              '200': {
                description: 'Price payload',
                content: { 'application/json': { schema: { type: 'object', properties: { price: { type: ['string','null'] } }, additionalProperties: false } } }
              },
              '400': { description: 'Missing url' }
            }
          }
        },
        '/api/report': {
          post: {
            summary: 'Compute report from ranked top items',
            description: 'Produces a lightweight analysis response for the selected camera, goal, and ranked top items.',
            parameters: [
              { name: 'idempotency-key', in: 'header', required: false, schema: { type: 'string' }, description: 'Optional idempotency key for future stateful writes' }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      cameraName: { type: 'string' },
                      goal: { type: 'string' },
                      top: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            name: { type: 'string' },
                            total: { type: 'number' },
                            weight_g: { type: 'number' },
                            price_chf: { type: 'number' },
                            type: { type: 'string' }
                          },
                          required: ['name','total','weight_g','price_chf','type'],
                          additionalProperties: false
                        }
                      }
                    },
                    required: ['cameraName','goal','top'],
                    additionalProperties: false
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Report response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        cameraName: { type: 'string' },
                        goal: { type: 'string' },
                        items: { type: 'array', items: { type: 'object' } },
                        verdicts: { type: 'array', items: { type: 'object' } },
                        summary: { type: 'string' }
                      },
                      additionalProperties: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const outPath = path.resolve(process.cwd(), 'openapi.json');
    await fs.writeFile(outPath, JSON.stringify(openapi, null, 2), 'utf-8');
    // eslint-disable-next-line no-console
    console.log(`Wrote OpenAPI to ${outPath}`);
  } catch (err) {
    // Fallback behavior: if DB is not reachable but an existing openapi.json is present,
    // do not fail CI/test runs. This avoids coupling codegen to a live database.
    const outPath = path.resolve(process.cwd(), 'openapi.json');
    try {
      await fs.stat(outPath);
      // eslint-disable-next-line no-console
      console.warn('OpenAPI generation: DB unavailable, using existing openapi.json');
      return;
    } catch {
      // Re-throw when no existing file is available
      throw err;
    }
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('OpenAPI generation failed', e);
  process.exitCode = 1;
});


