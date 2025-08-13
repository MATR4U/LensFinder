import request from 'supertest';
import express from 'express';

// Mock DB providers so tests don't require a real database
vi.mock('../db/provider.js', () => {
  return {
    getAllCameras: vi.fn().mockResolvedValue([
      {
        name: 'Alpha 7 IV',
        brand: 'Sony',
        mount: 'E',
        sensor_name: 'Full Frame',
        sensor_width_mm: 36,
        sensor_height_mm: 24,
        sensor_coc_mm: 0.03,
        sensor_crop: 1.0,
        ibis: true,
        price_chf: 2499,
        weight_g: 659,
        source_url: 'https://example.com/a7iv'
      }
    ]),
    getAllLenses: vi.fn().mockResolvedValue([
      {
        name: 'FE 24-70mm F2.8 GM',
        brand: 'Sony',
        mount: 'E',
        coverage: 'FF',
        focal_min_mm: 24,
        focal_max_mm: 70,
        aperture_min: 2.8,
        aperture_max: 22,
        weight_g: 886,
        ois: false,
        price_chf: 2199,
        weather_sealed: true,
        is_macro: false,
        distortion_pct: 1.2,
        focus_breathing_score: 8.5,
        source_url: 'https://example.com/24-70gm'
      }
    ]),
    getCounts: vi.fn().mockResolvedValue({ cameras: 1, lenses: 1 })
  };
});

let app: express.Express;

beforeAll(async () => {
  const { createRouter } = await import('../router.js');
  // Ensure config uses dev defaults during this suite
  process.env.VITEST = '1';
  app = express();
  app.use(express.json());
  // Disable API key enforcement
  process.env.API_KEY = '';
  // Stub DB pool health check to not require real DB
  vi.doMock('../db/pg.js', async () => ({
    getPool: () => ({
      query: async (sql?: string) => {
        if (!sql || /select\s+1/i.test(sql)) return { rows: [{ '?column?': 1 }] } as any;
        return { rows: [] } as any;
      }
    })
  }));
  // Disable API key requirement for tests
  process.env.API_KEY = '';
  app.use(createRouter({ rootDir: process.cwd() }));
  // Silence error logs during test
  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ error: 'error' });
  });
});

describe('API endpoints provide data (mocked providers)', () => {
  it('GET /api/cameras returns non-empty array', async () => {
    const res = await request(app).get('/api/cameras');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.headers['x-total-count']).toBeDefined();
    // Link header is present when limit is provided
  });

  it('GET /api/lenses returns non-empty array', async () => {
    const res = await request(app).get('/api/lenses');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.headers['x-total-count']).toBeDefined();
    // Link header is present when limit is provided
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


