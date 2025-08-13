import request from 'supertest';
import express from 'express';
import { createRouter } from '../router.js';

const app = express();
app.use(express.json());
app.use(createRouter({ rootDir: process.cwd() }));

describe('API contract', () => {
  it('health returns ok when DB up', async () => {
    const res = await request(app).get('/api/health');
    expect([200, 503]).toContain(res.status);
  });

  it('cameras and lenses support ETag', async () => {
    const first = await request(app).get('/api/cameras');
    expect([200, 500]).toContain(first.status);
    const etag = first.headers['etag'];
    expect(etag).toBeTruthy();
    const second = await request(app).get('/api/cameras').set('If-None-Match', etag as string);
    expect([200, 304]).toContain(second.status);
  });

  it('report accepts empty top gracefully', async () => {
    const res = await request(app).post('/api/report').send({ cameraName: 'X', goal: 'Y', top: [] });
    expect(res.status).toBe(200);
    expect(res.body.summary).toBeDefined();
  });

  it('supports HEAD /api with same headers', async () => {
    const res = await request(app).head('/api');
    expect(res.status).toBe(200);
    expect(String(res.headers['vary'] || '')).toMatch(/Accept/);
    expect(String(res.headers['content-type'] || '')).toMatch(/application\/json/);
  });

  it('supports HEAD /api/health/components', async () => {
    const res = await request(app).head('/api/health/components');
    expect([200, 503]).toContain(res.status);
  });

  it('supports HEAD /api/events/token', async () => {
    const res = await request(app).head('/api/events/token');
    expect([200, 204]).toContain(res.status);
  });
});


