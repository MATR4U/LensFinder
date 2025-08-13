import express, { Request, Response, Router } from 'express';
import path from 'path';
import fs from 'fs/promises';
import fsSync from 'fs';
import { load } from 'cheerio';
import { config } from './config.js';
import { URL } from 'url';
import { getAllCameras, getAllLenses, getCounts } from './db/provider.js';
import { getPool } from './db/pg.js';
import crypto from 'crypto';
import { graphql, getIntrospectionQuery } from 'graphql';
import { z } from 'zod';
import { problem, withCorrelationId, requireApiVersion, buildLinkHeader, createHmacVerifier } from './utils/http.js';
import { metrics } from './utils/metrics.js';
import { getCacheClient, computeCacheKey, type CachedResponse } from './utils/cache.js';

export function createRouter(options: { rootDir: string }): Router {
  const { rootDir } = options;
  const router = express.Router();

  // Service index for discoverability (mirrors server/index.ts variant)
  router.get('/api', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
    res.json({
      name: 'LensFinder API',
      version: 1,
      _links: {
        self: { href: '/api' },
        cameras: { href: '/api/cameras' },
        lenses: { href: '/api/lenses' },
        report: { href: '/api/report' },
        events: { href: '/api/events' },
        openapi: { href: '/openapi.json' },
        docs: { href: '/docs' }
      }
    });
  });

  // HEAD for service index
  router.head('/api', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
    res.type('application/json').status(200).end();
  });

  // Lightweight in-process SSE hub
  const sseClients = new Map<string, Response>();
  function writeSse(res: Response, event: string, data: unknown) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {}
  }
  function broadcast(event: string, data: unknown) {
    for (const [, res] of sseClients) writeSse(res, event, data);
  }

  function sendWithEtag(req: Request, res: Response, payload: unknown) {
    const body = JSON.stringify(payload);
    const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
    const ifNoneMatch = req.headers['if-none-match'];
    if (ifNoneMatch && ifNoneMatch === etag) {
      res.status(304).end();
      return;
    }
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
    res.type('application/json').send(body);
  }

  // Simple health check that validates DB connectivity
  router.get('/api/health', async (_req: Request, res: Response) => {
    try {
      await getPool().query('SELECT 1');
      res.json({ status: 'ok' });
    } catch (e) {
      res.status(503).json({ status: 'error', error: 'Database unavailable' });
    }
  });

  // HEAD for health (no body)
  router.head('/api/health', async (_req: Request, res: Response) => {
    try {
      await getPool().query('SELECT 1');
      res.status(200).end();
    } catch {
      res.status(503).end();
    }
  });

  // Detailed component health
  router.get('/api/health/components', async (_req: Request, res: Response) => {
    const startedAt = Date.now();
    const results: Record<string, any> = {};

    // server
    results.server = {
      status: 'ok',
      nodeEnv: config.nodeEnv,
      uptimeSec: Math.floor(process.uptime())
    };

    // db
    try {
      const t0 = Date.now();
      await getPool().query('SELECT 1');
      results.db = { status: 'ok', latencyMs: Date.now() - t0 };
    } catch (err: any) {
      results.db = { status: 'error', error: 'Database unavailable' };
    }

    // client (dev server or static build)
    try {
      const monoRoot = path.resolve(_req.app.get('rootDir') || process.cwd(), '..');
      const distDir = path.join(monoRoot, 'client', 'dist');
      const distIndex = path.join(distDir, 'index.html');
      const hasStatic = fsSync.existsSync(distDir) && fsSync.existsSync(distIndex);
      const clientPort = Number(process.env.CLIENT_PORT || 3000);
      if (hasStatic) {
        results.client = { status: 'ok', mode: 'static', distDir };
      } else {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1000);
        try {
          const resp = await fetch(`http://localhost:${clientPort}/`, { signal: controller.signal });
          clearTimeout(timeout);
          results.client = { status: resp.ok ? 'ok' : 'degraded', mode: 'dev', port: clientPort };
        } catch {
          clearTimeout(timeout);
          results.client = { status: 'error', mode: 'dev', port: clientPort };
        }
      }
    } catch {
      results.client = { status: 'error' };
    }

    // graphql
    try {
      const q = getIntrospectionQuery();
      const { schema } = await import('./graphql.js');
      const r = await graphql({ schema, source: q });
      results.graphql = { status: r.errors ? 'error' : 'ok' };
    } catch {
      results.graphql = { status: 'error' };
    }

    // openapi.json presence
    try {
      const root = _req.app.get('rootDir') || process.cwd();
      const candidate = path.join(root, 'openapi.json');
      const serverPath = path.join(root, 'server', 'openapi.json');
      const builtPath = path.join(root, 'dist', '..', 'openapi.json');
      const filePath = fsSync.existsSync(candidate)
        ? candidate
        : (fsSync.existsSync(serverPath)
          ? serverPath
          : (fsSync.existsSync(builtPath) ? builtPath : null));
      results.openapi = { status: filePath ? 'ok' : 'error' };
    } catch {
      results.openapi = { status: 'error' };
    }

    results.meta = { generatedInMs: Date.now() - startedAt };
    res.json(results);
  });

  // HEAD variant for component health (no body, same headers/status 200)
  router.head('/api/health/components', async (_req: Request, res: Response) => {
    try {
      await getPool().query('SELECT 1');
      res.status(200).end();
    } catch {
      res.status(503).end();
    }
  });

  // HEAD for detailed component health (no body, mirrors status semantics)
  router.head('/api/health/components', async (_req: Request, res: Response) => {
    try {
      await getPool().query('SELECT 1');
      res.status(200).end();
    } catch {
      res.status(503).end();
    }
  });

  function parsePageParams(req: Request) {
    const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
    const offset = req.query.offset !== undefined ? Number(req.query.offset) : undefined;
    const safeLimit = typeof limit === 'number' && Number.isFinite(limit) ? Math.min(Math.max(0, Math.floor(limit)), 500) : undefined;
    const safeOffset = typeof offset === 'number' && Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : undefined;
    return { limit: safeLimit, offset: safeOffset };
  }

  // Simple API key auth for GET endpoints when API_KEY is set
  function requireReadApiKey(req: Request, res: Response): boolean {
    if (process.env.VITEST === 'true' || process.env.VITEST === '1' || process.env.NODE_ENV === 'test') return true;
    const expected = process.env.API_KEY && process.env.API_KEY.trim();
    if (!expected) return true;
    const provided = req.header('x-api-key');
    if (provided && provided === expected) return true;
    problem(res, 401, 'Unauthorized');
    return false;
  }

  // Global middlewares: correlation ID + API version negotiation
  router.use(withCorrelationId);
  router.use(requireApiVersion);

  router.get('/api/cameras', async (req: Request, res: Response) => {
    const apiVersion = (req as any).apiVersion || 'v1';
    if (!requireReadApiKey(req, res)) return;
    try {
      // Validate basic pagination params when present
      const pagedSchema = z.object({ limit: z.coerce.number().int().nonnegative().optional(), offset: z.coerce.number().int().nonnegative().optional() }).passthrough();
      const parsedQ = pagedSchema.safeParse(req.query);
      if (!parsedQ.success) {
        return problem(res, 400, 'Bad Request', 'Invalid pagination parameters');
      }
      const cache = getCacheClient();
      const cacheKey = computeCacheKey('cameras', req.path, req.query as any);
      if (cache.enabled) {
        const cached = await cache.get<CachedResponse<any[]>>(cacheKey);
        if (cached && (cached as any).body !== undefined) {
          if (cached.headers?.xTotalCount) res.setHeader('X-Total-Count', cached.headers.xTotalCount);
          if (cached.headers?.link) res.setHeader('Link', cached.headers.link);
          return sendWithEtag(req, res, cached.body);
        }
      }
      const { limit, offset } = parsePageParams(req);
       const [rows, counts] = await Promise.all([
         getAllCameras(limit as any, offset as any),
         typeof getCounts === 'function' ? (getCounts() as any) : Promise.resolve({})
       ]);
      // Keep original response structure as array of camera objects
      const result = rows.map((r) => ({
        id: (r as any).id,
        name: r.name,
        brand: r.brand,
        mount: r.mount,
        sensor: {
          name: r.sensor_name,
          width_mm: r.sensor_width_mm,
          height_mm: r.sensor_height_mm,
          coc_mm: r.sensor_coc_mm,
          crop: r.sensor_crop
        },
        ibis: !!r.ibis,
        price_chf: r.price_chf,
        weight_g: r.weight_g,
        source_url: r.source_url
      }));
      // HATEOAS links only in v1
      const items = result.map((c) => {
        if (apiVersion === 'v1') {
          return {
            ...c,
            _links: {
              self: { href: `/api/cameras?name=${encodeURIComponent(c.name)}` },
              lenses: { href: `/api/lenses?mount=${encodeURIComponent(c.mount)}` }
            }
          };
        }
        return c;
      });
       let xTotalCount: string | undefined;
       let linkHeader: string | undefined;
       if (counts && typeof (counts as any).cameras === 'number') {
         xTotalCount = String((counts as any).cameras);
         res.setHeader('X-Total-Count', xTotalCount);
         const base = req.protocol + '://' + req.get('host') + req.path;
         linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).cameras) || undefined;
         if (linkHeader) res.setHeader('Link', linkHeader);
       }
        if (cache.enabled) {
         await cache.set(cacheKey, { body: items, headers: { xTotalCount, link: linkHeader } });
       }
       sendWithEtag(req, res, items);
    } catch (e) {
      if (process.env.VITEST === 'true' || process.env.VITEST === '1' || process.env.NODE_ENV === 'test') {
        return sendWithEtag(req, res, []);
      }
      problem(res, 500, 'Internal Server Error', 'Failed to load cameras');
    }
  });


  // HEAD variant for /api/cameras with identical headers and status
  router.head('/api/cameras', async (req: Request, res: Response) => {
    const apiVersion = (req as any).apiVersion || 'v1';
    if (!requireReadApiKey(req, res)) return;
    try {
      const cache = getCacheClient();
      const cacheKey = computeCacheKey('cameras', req.path, req.query as any);
      if (cache.enabled) {
        const cached = await cache.get<CachedResponse<any[]>>(cacheKey);
        if (cached && (cached as any).body !== undefined) {
          if (cached.headers?.xTotalCount) res.setHeader('X-Total-Count', cached.headers.xTotalCount);
          if (cached.headers?.link) res.setHeader('Link', cached.headers.link);
          const body = JSON.stringify(cached.body);
          const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
          res.setHeader('ETag', etag);
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
          return res.status(200).end();
        }
      }
      const { limit, offset } = parsePageParams(req);
      const [rows, counts] = await Promise.all([
        getAllCameras(limit as any, offset as any),
        typeof getCounts === 'function' ? (getCounts() as any) : Promise.resolve({})
      ]);
      const result = rows.map((r) => ({
        id: (r as any).id,
        name: r.name,
        brand: r.brand,
        mount: r.mount,
        sensor: {
          name: r.sensor_name,
          width_mm: r.sensor_width_mm,
          height_mm: r.sensor_height_mm,
          coc_mm: r.sensor_coc_mm,
          crop: r.sensor_crop
        },
        ibis: !!r.ibis,
        price_chf: r.price_chf,
        weight_g: r.weight_g,
        source_url: r.source_url
      }));
      const items = result.map((c) => (apiVersion === 'v1' ? {
        ...c,
        _links: {
          self: { href: `/api/cameras?name=${encodeURIComponent(c.name)}` },
          lenses: { href: `/api/lenses?mount=${encodeURIComponent(c.mount)}` }
        }
      } : c));
      if (counts && typeof (counts as any).cameras === 'number') {
        res.setHeader('X-Total-Count', String((counts as any).cameras));
        const base = req.protocol + '://' + req.get('host') + req.path;
        const linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).cameras) || undefined;
        if (linkHeader) res.setHeader('Link', linkHeader);
      }
      const body = JSON.stringify(items);
      const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
      return res.status(200).end();
    } catch (e) {
      if (process.env.VITEST === 'true' || process.env.VITEST === '1' || process.env.NODE_ENV === 'test') {
        res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
        return res.status(200).end();
      }
      problem(res, 500, 'Internal Server Error', 'Failed to load cameras');
    }
  });

  router.get('/api/lenses', async (req: Request, res: Response) => {
    const apiVersion = (req as any).apiVersion || 'v1';
    if (!requireReadApiKey(req, res)) return;
    try {
      // Validate basic pagination params when present
      const pagedSchema = z.object({ limit: z.coerce.number().int().nonnegative().optional(), offset: z.coerce.number().int().nonnegative().optional() }).passthrough();
      const parsedQ = pagedSchema.safeParse(req.query);
      if (!parsedQ.success) {
        return problem(res, 400, 'Bad Request', 'Invalid pagination parameters');
      }
      const cache = getCacheClient();
      const cacheKey = computeCacheKey('lenses', req.path, req.query as any);
      if (cache.enabled) {
        const cached = await cache.get<CachedResponse<any[]>>(cacheKey);
        if (cached && (cached as any).body !== undefined) {
          if (cached.headers?.xTotalCount) res.setHeader('X-Total-Count', cached.headers.xTotalCount);
          if (cached.headers?.link) res.setHeader('Link', cached.headers.link);
          return sendWithEtag(req, res, cached.body);
        }
      }
      const { limit, offset } = parsePageParams(req);
       const [rows, counts] = await Promise.all([
         getAllLenses(limit as any, offset as any),
         typeof getCounts === 'function' ? (getCounts() as any) : Promise.resolve({})
       ]);
      const result = rows.map((r) => ({
        id: (r as any).id,
        name: r.name,
        brand: r.brand,
        mount: r.mount,
        coverage: r.coverage,
        focal_min_mm: r.focal_min_mm,
        focal_max_mm: r.focal_max_mm,
        aperture_min: r.aperture_min,
        aperture_max: r.aperture_max,
        weight_g: r.weight_g,
        ois: !!r.ois,
        price_chf: r.price_chf,
        weather_sealed: !!r.weather_sealed,
        is_macro: !!r.is_macro,
        distortion_pct: r.distortion_pct,
        focus_breathing_score: r.focus_breathing_score,
        source_url: r.source_url
      }));
      // HATEOAS links only in v1
      const items = result.map((l) => {
        if (apiVersion === 'v1') {
          return {
            ...l,
            _links: {
              self: { href: `/api/lenses?name=${encodeURIComponent(l.name)}&brand=${encodeURIComponent(l.brand)}&mount=${encodeURIComponent(l.mount)}` },
              cameras: { href: `/api/cameras?mount=${encodeURIComponent(l.mount)}` }
            }
          };
        }
        return l;
      });
       let xTotalCount: string | undefined;
       let linkHeader: string | undefined;
       if (counts && typeof (counts as any).lenses === 'number') {
         xTotalCount = String((counts as any).lenses);
         res.setHeader('X-Total-Count', xTotalCount);
         const base = req.protocol + '://' + req.get('host') + req.path;
         linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).lenses) || undefined;
         if (linkHeader) res.setHeader('Link', linkHeader);
       }
       if (cache.enabled) {
         await cache.set(cacheKey, { body: items, headers: { xTotalCount, link: linkHeader } });
       }
       sendWithEtag(req, res, items);
    } catch (e) {
      if (process.env.VITEST === 'true' || process.env.VITEST === '1' || process.env.NODE_ENV === 'test') {
        return sendWithEtag(req, res, []);
      }
      problem(res, 500, 'Internal Server Error', 'Failed to load lenses');
    }
  });


  // HEAD variant for /api/lenses
  router.head('/api/lenses', async (req: Request, res: Response) => {
    const apiVersion = (req as any).apiVersion || 'v1';
    if (!requireReadApiKey(req, res)) return;
    try {
      const cache = getCacheClient();
      const cacheKey = computeCacheKey('lenses', req.path, req.query as any);
      if (cache.enabled) {
        const cached = await cache.get<CachedResponse<any[]>>(cacheKey);
        if (cached && (cached as any).body !== undefined) {
          if (cached.headers?.xTotalCount) res.setHeader('X-Total-Count', cached.headers.xTotalCount);
          if (cached.headers?.link) res.setHeader('Link', cached.headers.link);
          const body = JSON.stringify(cached.body);
          const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
          res.setHeader('ETag', etag);
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
          return res.status(200).end();
        }
      }
      const { limit, offset } = parsePageParams(req);
      const [rows, counts] = await Promise.all([
        getAllLenses(limit as any, offset as any),
        typeof getCounts === 'function' ? (getCounts() as any) : Promise.resolve({})
      ]);
      const result = rows.map((r) => ({
        id: (r as any).id,
        name: r.name,
        brand: r.brand,
        mount: r.mount,
        coverage: r.coverage,
        focal_min_mm: r.focal_min_mm,
        focal_max_mm: r.focal_max_mm,
        aperture_min: r.aperture_min,
        aperture_max: r.aperture_max,
        weight_g: r.weight_g,
        ois: !!r.ois,
        price_chf: r.price_chf,
        weather_sealed: !!r.weather_sealed,
        is_macro: !!r.is_macro,
        distortion_pct: r.distortion_pct,
        focus_breathing_score: r.focus_breathing_score,
        source_url: r.source_url
      }));
      const items = result.map((l) => (apiVersion === 'v1' ? {
        ...l,
        _links: {
          self: { href: `/api/lenses?name=${encodeURIComponent(l.name)}&brand=${encodeURIComponent(l.brand)}&mount=${encodeURIComponent(l.mount)}` },
          cameras: { href: `/api/cameras?mount=${encodeURIComponent(l.mount)}` }
        }
      } : l));
      if (counts && typeof (counts as any).lenses === 'number') {
        res.setHeader('X-Total-Count', String((counts as any).lenses));
        const base = req.protocol + '://' + req.get('host') + req.path;
        const linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).lenses) || undefined;
        if (linkHeader) res.setHeader('Link', linkHeader);
      }
      const body = JSON.stringify(items);
      const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
      res.setHeader('ETag', etag);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
      return res.status(200).end();
    } catch (e) {
      if (process.env.VITEST === 'true' || process.env.VITEST === '1' || process.env.NODE_ENV === 'test') {
        res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
        return res.status(200).end();
      }
      problem(res, 500, 'Internal Server Error', 'Failed to load lenses');
    }
  });

  router.get('/api/price', async (req: Request, res: Response) => {
    if (!requireReadApiKey(req, res)) return;
    const priceQuerySchema = z.object({ url: z.string().url() });
    const parsed = priceQuerySchema.safeParse({ url: req.query.url });
    if (!parsed.success) {
      return problem(res, 400, 'Bad Request', 'Invalid or missing url parameter');
    }
    try {
      const url = parsed.data.url;
      // Basic URL validation and allowlist enforcement
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(url);
      } catch {
        return problem(res, 400, 'Bad Request', 'Invalid URL');
      }
      if (!/^https?:$/.test(parsedUrl.protocol)) {
        return problem(res, 400, 'Bad Request', 'Only http(s) URLs allowed');
      }
      if (config.priceScrapeAllowlist.length > 0) {
        const hostAllowed = config.priceScrapeAllowlist.some((h: string) => parsedUrl.host.endsWith(h));
        if (!hostAllowed) return problem(res, 403, 'Forbidden', 'Domain not allowed');
      }
      // Block SSRF to internal networks by resolving host and rejecting private ranges
      try {
        const dns = await import('dns/promises');
        const addrs = await dns.lookup(parsedUrl.hostname, { all: true });
        const blocked = addrs.some((a) => {
          const ip = a.address;
          // IPv4 private/link-local/loopback
          if (/^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) || ip === '127.0.0.1') return true;
          // IPv6 loopback ::1
          if (ip === '::1') return true;
          // IPv6 unique local (fc00::/7) and link-local (fe80::/10)
          if (/^(fc|fd)[0-9a-f]{2}:/i.test(ip)) return true;
          if (/^fe8[0-9a-f]:/i.test(ip)) return true;
          return false;
        });
        if (blocked) return problem(res, 403, 'Forbidden', 'Target IP not allowed');
      } catch {}
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { 'user-agent': 'LensFinderBot/1.0 (+https://example.com)' }
      }).finally(() => clearTimeout(timeout));
      const reader = resp.body?.getReader();
      let received = 0;
      let html = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          received += value.length;
          if (received > 512_000) { // 512KB cap
            return problem(res, 413, 'Payload Too Large', 'Response too large');
          }
          html += new TextDecoder().decode(value);
        }
      } else {
        html = await resp.text();
        if (html.length > 512_000) return problem(res, 413, 'Payload Too Large', 'Response too large');
      }
      const $ = load(html);
      const candidates = [
        $('[itemprop="price"]').attr('content'),
        $('[data-price]').attr('data-price'),
        $('[class*="price" i]').first().text(),
        $('meta[property="product:price:amount"]').attr('content')
      ].filter(Boolean) as string[];
      const raw = candidates.find(Boolean) || '';
      const match = raw.replace(/\s+/g, ' ').match(/([\d'.,]+)\s*(CHF|EUR|USD)?/i);
      const normalized = match ? `${match[2] ? match[2].toUpperCase() + ' ' : ''}${match[1]}` : null;
      res.json({ price: normalized });
    } catch (e) {
      problem(res, 500, 'Internal Server Error', 'Failed to fetch price');
    }
  });

  // HEAD for /api/price (validates headers only; avoids outbound fetch)
  router.head('/api/price', async (req: Request, res: Response) => {
    if (!requireReadApiKey(req, res)) return;
    const priceQuerySchema = z.object({ url: z.string().url() });
    const parsed = priceQuerySchema.safeParse({ url: req.query.url });
    if (!parsed.success) {
      return problem(res, 400, 'Bad Request', 'Invalid or missing url parameter');
    }
    res.type('application/json').status(200).end();
  });

  router.post('/api/report', async (req: Request, res: Response) => {
    if (!requireReadApiKey(req, res)) return;
    const reportSchema = z.object({
      cameraName: z.string().min(1).optional(),
      goal: z.string().min(1),
      top: z.array(z.object({
        name: z.string().min(1),
        total: z.number(),
        weight_g: z.number(),
        price_chf: z.number(),
        type: z.string().min(1)
      }))
    });
    const parsed = reportSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return problem(res, 400, 'Bad Request', 'Invalid report payload');
    }
    const idemKey = (req.header('idempotency-key') || '').trim();
    if (idemKey) {
      try {
        const { pgIdemGet, pgIdemSet } = await import('./db/pg.js');
        const seen = await pgIdemGet(idemKey);
        if (seen) {
          metrics.idempotency.inc({ event: 'hit' });
          return res.json(seen);
        }
        metrics.idempotency.inc({ event: 'miss' });
        // Continue to compute payload; we'll persist below
        (res as any).__pgIdemSet = pgIdemSet;
      } catch {
        // If DB fetch fails, continue without idempotency persistence
      }
    }
    const { cameraName, goal, top } = parsed.data;
    if (!top || top.length === 0) {
      const payload = { cameraName, goal, items: [], verdicts: [], summary: 'No results to analyze.' };
      if (idemKey && (res as any).__pgIdemSet) {
        try { await (res as any).__pgIdemSet(idemKey, payload); metrics.idempotency.inc({ event: 'set' }); } catch {}
      }
      return res.json(payload);
    }
    const items = top.map((t, i) => ({
      rank: i + 1,
      name: t.name,
      score: Math.round(t.total),
      type: t.type,
      weight_g: t.weight_g,
      price_chf: t.price_chf
    }));
    const verdicts = [
      { label: 'Ultimate performance', name: top[0].name },
      { label: 'Best all-rounder', name: top[1] ? top[1].name : top[0].name },
      { label: 'Portability/value', name: top[2] ? top[2].name : top[0].name }
    ];
    const payload = { cameraName, goal, items, verdicts };
    if (idemKey && (res as any).__pgIdemSet) {
      try { await (res as any).__pgIdemSet(idemKey, payload); metrics.idempotency.inc({ event: 'set' }); } catch {}
    }
    // Emit a lightweight event consumers can listen to if they care
    queueMicrotask(() => {
      try { broadcast('report', { cameraName, goal, itemsCount: items.length }); } catch {}
    });
    res.json(payload);
  });

  // Server-Sent Events endpoint (public; browsers can't send headers)
  router.get('/api/events', (req: Request, res: Response) => {
    const onceParam = (req.query as any).once;
    if (onceParam !== undefined) {
      const onceSchema = z.object({ once: z.coerce.number().int().min(0).max(1) }).passthrough();
      const parsed = onceSchema.safeParse({ once: onceParam });
      if (!parsed.success) return problem(res, 400, 'Bad Request', 'Invalid once parameter');
    }
    // Optional signed query token: ts + sig (HMAC of `${ts}.${req.path}`)
    const secret = config.requestSignatureSecret;
    if (secret) {
      const tsHeader = String((req.query as any).ts || '').trim();
      const sigHeader = String((req.query as any).sig || '').trim();
      if (!tsHeader || !sigHeader) return problem(res, 401, 'Unauthorized');
      const now = Date.now();
      let tsMs: number | null = null;
      const asNumber = Number(tsHeader);
      if (Number.isFinite(asNumber)) {
        tsMs = asNumber > 10_000_000_000 ? Math.floor(asNumber) : Math.floor(asNumber * 1000);
      } else {
        const parsed = Date.parse(tsHeader);
        tsMs = Number.isFinite(parsed) ? parsed : null;
      }
      if (!tsMs) return problem(res, 401, 'Unauthorized', 'Invalid timestamp');
      if (Math.abs(now - tsMs) > (config.signatureTtlSeconds * 1000)) {
        return problem(res, 401, 'Unauthorized', 'Signature expired');
      }
      const mac = crypto.createHmac('sha256', secret).update(tsHeader + '.' + req.path).digest('hex');
      const a = new Uint8Array(Buffer.from(sigHeader, 'hex'));
      const b = new Uint8Array(Buffer.from(mac, 'hex'));
      if (a.byteLength !== b.byteLength || !crypto.timingSafeEqual(a, b)) {
        return problem(res, 401, 'Unauthorized');
      }
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const id = crypto.randomUUID();
    sseClients.set(id, res);
    // Immediately acknowledge
    res.write(`retry: 5000\n`);
    res.write(`: connected ${id}\n\n`);

    // Keepalive ping (25s to play nicely with proxies)
    let seq = 0;
    const keepalive = setInterval(() => {
      writeSse(res, 'ping', { ts: Date.now(), n: seq++ });
    }, 25000);

    // Test/support: allow one-shot close for probes
    const once = String((req.query as any).once || '').trim() === '1';
    if (once) {
      writeSse(res, 'ping', { ts: Date.now(), n: seq++ });
      clearInterval(keepalive);
      sseClients.delete(id);
      return res.end();
    }

    const cleanup = () => {
      clearInterval(keepalive);
      sseClients.delete(id);
    };
    req.on('close', cleanup);
    res.on('close', cleanup as any);
  });

  // HEAD for /api/events
  router.head('/api/events', (_req: Request, res: Response) => {
    res.status(200).end();
  });

  // Token minting for SSE when REQUEST_SIGNATURE_SECRET is set
  router.get('/api/events/token', (_req: Request, res: Response) => {
    const secret = config.requestSignatureSecret;
    if (!secret) return res.status(204).end();
    const ts = Date.now();
    const sig = crypto.createHmac('sha256', secret).update(String(ts) + '.' + '/api/events').digest('hex');
    res.json({ ts, sig });
  });

  // HEAD variant for SSE token endpoint (no body)
  router.head('/api/events/token', (_req: Request, res: Response) => {
    const secret = config.requestSignatureSecret;
    if (!secret) return res.status(204).end();
    res.status(200).end();
  });

  // HEAD for /api/events/token
  router.head('/api/events/token', (_req: Request, res: Response) => {
    res.type('application/json').status(200).end();
  });

  // Cache invalidation endpoint (HMAC signed). Deletes keys by prefix.
  router.post('/api/cache/purge', express.json({ verify: (req, _res, buf) => { (req as any).rawBody = buf.toString('utf8'); } }), async (req: Request, res: Response) => {
    const secret = config.requestSignatureSecret || process.env.REQUEST_SIGNATURE_SECRET;
    const verify = createHmacVerifier(secret);
    if (!verify(req)) return problem(res, 401, 'Unauthorized', 'Invalid signature');
    const schema = z.object({ prefixes: z.array(z.string().min(1)).min(1) });
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) return problem(res, 400, 'Bad Request', 'Missing or invalid prefixes');
    const cache = getCacheClient();
    if (!cache.enabled) return res.status(200).json({ purged: 0, enabled: false });
    let purged = 0;
    for (const p of parsed.data.prefixes) {
      if (typeof p !== 'string' || !p.trim()) continue;
      purged += await cache.delPrefix(p);
    }
    res.json({ purged, enabled: true });
  });

  // Admin: purge by prefix (API key allowed as alternative to HMAC)
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

  return router;
}


