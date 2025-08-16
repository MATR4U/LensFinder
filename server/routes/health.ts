import type { Request, Response, Router } from 'express';
import { getPool } from '../db/pg.js';
import path from 'path';
import fsSync from 'fs';
import { graphql, getIntrospectionQuery } from 'graphql';

export function mountHealthRoutes(router: Router) {
  // Simple health
  router.get('/api/health', async (_req: Request, res: Response) => {
    try {
      await getPool().query('SELECT 1');
      res.json({ status: 'ok' });
    } catch {
      res.status(503).json({ status: 'error', error: 'Database unavailable' });
    }
  });
  router.head('/api/health', async (_req: Request, res: Response) => {
    try { await getPool().query('SELECT 1'); res.status(200).end(); } catch { res.status(503).end(); }
  });

  router.get('/api/health/components', async (_req: Request, res: Response) => {
    const startedAt = Date.now();
    const results: Record<string, any> = {};
    results.server = { status: 'ok', uptimeSec: Math.floor(process.uptime()) };
    try { await getPool().query('SELECT 1'); results.db = { status: 'ok' }; } catch { results.db = { status: 'error' }; }
    try {
      const monoRoot = path.resolve(_req.app.get('rootDir') || process.cwd(), '..');
      const distDir = path.join(monoRoot, 'client', 'dist');
      const distIndex = path.join(distDir, 'index.html');
      const hasStatic = fsSync.existsSync(distDir) && fsSync.existsSync(distIndex);
      results.client = { status: hasStatic ? 'ok' : 'unknown', mode: hasStatic ? 'static' : 'dev' };
    } catch { results.client = { status: 'error' }; }
    try {
      const q = getIntrospectionQuery();
      const { schema } = await import('../graphql.js');
      const r = await graphql({ schema, source: q });
      results.graphql = { status: r.errors ? 'error' : 'ok' };
    } catch { results.graphql = { status: 'error' }; }
    results.meta = { generatedInMs: Date.now() - startedAt };
    res.json(results);
  });
  router.head('/api/health/components', async (_req: Request, res: Response) => {
    try { await getPool().query('SELECT 1'); res.status(200).end(); } catch { res.status(503).end(); }
  });
}


