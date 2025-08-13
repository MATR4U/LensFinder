import request from 'supertest';
import express from 'express';
import crypto from 'crypto';

// In-memory cache mock layered over the real module to keep key logic
const store = new Map<string, any>();
vi.mock('../utils/cache.js', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    getCacheClient: () => ({
      enabled: true,
      async get(key: string) { return store.get(key) ?? null; },
      async set(key: string, value: any) { store.set(key, value); },
      async delPrefix(prefix: string) {
        let purged = 0;
        for (const k of Array.from(store.keys())) {
          if (k.startsWith(prefix)) { store.delete(k); purged++; }
        }
        return purged;
      }
    })
  };
});

describe('Cache behavior and purge endpoint', () => {
  let app: express.Express;
  let computeCacheKey: (kind: string, path: string, params?: Record<string, unknown>) => string;

  beforeAll(async () => {
    process.env.REQUEST_SIGNATURE_SECRET = 'test-secret';
    const cacheMod: any = await import('../utils/cache.js');
    computeCacheKey = cacheMod.computeCacheKey;
    const { createRouter } = await import('../router.js');
    app = express();
    app.use(express.json());
    app.use(createRouter({ rootDir: process.cwd() }));
  });

  it('serves cached cameras with headers when present', async () => {
    const key = computeCacheKey('cameras', '/api/cameras', {});
    const headers = { xTotalCount: '123', link: '<http://x>; rel="self"' };
    store.set(key, { body: [], headers });
    const res = await request(app).get('/api/cameras');
    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBe('123');
    expect(res.headers['link']).toContain('rel="self"');
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('serves cached lenses with headers when present', async () => {
    const key = computeCacheKey('lenses', '/api/lenses', {});
    const headers = { xTotalCount: '42', link: '<http://x>; rel="self"' };
    store.set(key, { body: [], headers });
    const res = await request(app).get('/api/lenses');
    expect(res.status).toBe(200);
    expect(res.headers['x-total-count']).toBe('42');
    expect(res.headers['link']).toContain('rel="self"');
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('purges cache by prefix with valid HMAC signature', async () => {
    // Seed some keys
    store.set('cameras:/api/cameras?limit=10', { body: [] });
    store.set('cameras:/api/cameras?limit=20', { body: [] });
    store.set('lenses:/api/lenses?limit=10', { body: [] });

    const body = { prefixes: ['cameras:', 'lenses:'] };
    const ts = String(Date.now());
    const mac = crypto.createHmac('sha256', process.env.REQUEST_SIGNATURE_SECRET as string)
      .update(ts + '.' + JSON.stringify(body))
      .digest('hex');

    const res = await request(app)
      .post('/api/cache/purge')
      .set('x-timestamp', ts)
      .set('x-signature', mac)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body.enabled).toBe(true);
    expect(res.body.purged).toBeGreaterThanOrEqual(3);
  });

  it('rejects purge without valid signature', async () => {
    const res = await request(app)
      .post('/api/cache/purge')
      .send({ prefixes: ['cameras:'] });
    expect([400, 401]).toContain(res.status);
  });
});



