import request from 'supertest';
import express from 'express';

vi.mock('../db/provider.js', () => {
  return {
    getAllCameras: vi.fn().mockResolvedValue([
      {
        name: 'Alpha 7 IV', brand: 'Sony', mount: 'E',
        sensor_name: 'Full Frame', sensor_width_mm: 36, sensor_height_mm: 24, sensor_coc_mm: 0.03, sensor_crop: 1.0,
        ibis: true, price_chf: 2499, weight_g: 659, source_url: 'https://example.com/a7iv'
      }
    ]),
    getAllLenses: vi.fn().mockResolvedValue([
      {
        name: 'FE 24-70mm F2.8 GM', brand: 'Sony', mount: 'E', coverage: 'FF', focal_min_mm: 24, focal_max_mm: 70,
        aperture_min: 2.8, aperture_max: 22, weight_g: 886, ois: false, price_chf: 2199, weather_sealed: true, is_macro: false,
        distortion_pct: 1.2, focus_breathing_score: 8.5, source_url: 'https://example.com/24-70gm'
      }
    ])
  };
});

let app: express.Express;

beforeAll(async () => {
  const { createRouter } = await import('../router.js');
  const { schema } = await import('../graphql.js');
  const { createGraphQLHandler } = await import('../graphqlHandler.js');
  app = express();
  app.use(express.json());
  app.use(createRouter({ rootDir: process.cwd() }));
  app.post('/graphql', createGraphQLHandler(schema));
});

describe('GraphQL API', () => {
  it('queries cameras and lenses', async () => {
    const query = `{
      cameras { name brand mount sensor { name width_mm height_mm coc_mm crop } }
      lenses { name brand mount coverage focal_min_mm focal_max_mm ois }
    }`;
    const res = await request(app).post('/graphql').send({ query });
    expect(res.status).toBe(200);
    expect(res.body.data.cameras.length).toBeGreaterThan(0);
    expect(res.body.data.lenses.length).toBeGreaterThan(0);
  });

  it('mutation report returns items/verdicts', async () => {
    const mutation = `mutation($cam: String!, $goal: String!, $top: [ReportItemInput!]!) {
      report(cameraName: $cam, goal: $goal, top: $top) { cameraName goal items { name rank } verdicts { label name } }
    }`;
    const variables = {
      cam: 'A', goal: 'B', top: [
        { name: 'L1', total: 91, weight_g: 1000, price_chf: 2000, type: 'zoom' },
        { name: 'L2', total: 84, weight_g: 900, price_chf: 1500, type: 'prime' }
      ]
    };
    const res = await request(app).post('/graphql').send({ query: mutation, variables });
    expect(res.status).toBe(200);
    expect(res.body.data.report.items.length).toBe(2);
    expect(res.body.data.report.verdicts.length).toBeGreaterThan(0);
  });
});


