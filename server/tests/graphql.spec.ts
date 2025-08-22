import request from 'supertest';
import express from 'express';
import { beforeAll, describe, it, expect } from 'vitest';

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


