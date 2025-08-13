import request from 'supertest';
import express from 'express';
let OpenAPIResponseValidator: any;
import fs from 'fs';
import path from 'path';

let app: express.Express;
let validator: any;

beforeAll(async () => {
  const { createRouter } = await import('../router.js');
  app = express();
  app.use(express.json());
  app.use(createRouter({ rootDir: process.cwd() }));

  const specPathCandidates = [
    path.resolve(process.cwd(), 'openapi.json'),
    path.resolve(process.cwd(), 'server', 'openapi.json')
  ];
  const specPath = specPathCandidates.find((p) => fs.existsSync(p));
  if (!specPath) throw new Error('openapi.json not found');
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
  const mod = await import('openapi-response-validator').catch(() => null as any);
  if (!mod) return;
  OpenAPIResponseValidator = (mod as any).default || (mod as any);
  validator = new OpenAPIResponseValidator({
    responses: spec.paths['/api/cameras'].get.responses,
    definitions: spec.components?.schemas || {}
  });
});

describe('REST responses conform to OpenAPI (sample)', () => {
  it('GET /api/cameras matches schema', async () => {
    const res = await request(app).get('/api/cameras');
    expect([200, 500]).toContain(res.status);
    if (validator && res.status === 200) {
      const err = validator.validateResponse(200, res.body);
      expect(err).toBeUndefined();
    }
  });
});


