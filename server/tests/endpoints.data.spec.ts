import request from 'supertest';
import express from 'express';
import { beforeAll, describe, it, expect, vi } from 'vitest';

let app: express.Express;

beforeAll(async () => {
  const { createRouter } = await import('../router.js');
  process.env.VITEST = '1';
  process.env.FILE_REPO_FIXTURES_DIR = `${process.cwd()}/server/tests/fixtures`;
  process.env.API_KEY = '';
  app = express();
  app.use(express.json());

  // Stub DB pool health check so routes that ping DB don't fail
  vi.doMock('../db/pg.js', async () => ({
    getPool: () => ({
      query: async (sql?: string) => {
        if (!sql || /select\s+1/i.test(sql)) return { rows: [{ '?column?': 1 }] } as any;
        return { rows: [] } as any;
      }
    })
  }));

  app.use(createRouter({ rootDir: process.cwd() }));

  // Silence error logs during test
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ error: 'error' });
  });
});

describe('API endpoints provide data (file repo)', () => {
  it('GET /api/cameras returns non-empty array from fixtures', async () => {
    const res = await request(app).get('/api/cameras').query({ limit: 50, offset: 0 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.headers['x-total-count']).toBeDefined();
  });

  it('GET /api/lenses returns non-empty array from fixtures', async () => {
    const res = await request(app).get('/api/lenses').query({ limit: 50, offset: 0 });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.headers['x-total-count']).toBeDefined();
  });

  it('GET /api/price returns a normalized price when upstream contains recognizable markup', async () => {
    const html = '<meta property="product:price:amount" content="1235" />';
    const fetchSpy = vi
      .spyOn(globalThis as unknown as { fetch: (input: string) => Promise<{ text: () => Promise<string> }> }, 'fetch')
      .mockResolvedValue({ text: async () => html } as any);

    const res = await request(app).get('/api/price').query({ url: 'https://shop.example/product' });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe('1235');

    fetchSpy.mockRestore();
  });

  it('GET /api/events establishes an SSE stream', async () => {
    const res = await request(app).get('/api/events').query({ once: '1' });
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/event-stream');
  });
});


