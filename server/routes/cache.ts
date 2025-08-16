import type { Router, Request, Response } from 'express';
import express from 'express';
import { z } from 'zod';
import { getCacheClient } from '../utils/cache.js';
import { problem, createHmacVerifier } from '../utils/http.js';
import { config } from '../config.js';

export function mountCacheRoutes(router: Router) {
  router.post('/api/cache/purge', express.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf.toString('utf8'); } }), async (req: Request, res: Response) => {
    const secret = config.requestSignatureSecret || process.env.REQUEST_SIGNATURE_SECRET;
    const verify = createHmacVerifier(secret);
    if (!verify(req)) return problem(res, 401, 'Unauthorized', 'Invalid signature');
    const schema = z.object({ prefixes: z.array(z.string().min(1)).min(1) });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return problem(res, 400, 'Bad Request', 'Missing or invalid prefixes');
    const cache = getCacheClient();
    if (!cache.enabled) return res.status(200).json({ purged: 0, enabled: false });
    let purged = 0; for (const p of parsed.data.prefixes) { if (typeof p !== 'string' || !p.trim()) continue; purged += await cache.delPrefix(p); }
    res.json({ purged, enabled: true });
  });

  router.post('/api/admin/cache/purge', express.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf.toString('utf8'); } }), async (req: Request, res: Response) => {
    const expected = (config.apiKey || '').trim();
    const provided = (req.header('x-api-key') || '').trim();
    const secret = config.requestSignatureSecret || process.env.REQUEST_SIGNATURE_SECRET;
    const verify = createHmacVerifier(secret);
    const hmacOk = verify(req);
    if (!expected && !hmacOk) return problem(res, 401, 'Unauthorized');
    if (expected && provided !== expected && !hmacOk) return problem(res, 401, 'Unauthorized');
    const schema = z.object({ prefix: z.string().min(1) });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return problem(res, 400, 'Bad Request', 'Missing prefix');
    const cache = getCacheClient();
    if (!cache.enabled) return res.status(200).json({ purged: 0, enabled: false });
    const purged = await cache.delPrefix(parsed.data.prefix);
    res.json({ purged, enabled: true });
  });
}


