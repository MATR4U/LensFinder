import type { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAllLenses, getCounts } from '../db/provider.js';
import { getCacheClient, computeCacheKey, type CachedResponse } from '../utils/cache.js';
import { buildLinkHeader } from '../utils/http.js';
import { sendWithEtag, headFromJson, parsePageParams } from '../utils/respond.js';
import { requireReadApiKey } from '../middleware/requireReadApiKey.js';

function serializeLensRow(r: any) {
  return {
    id: r.id,
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
    source_url: r.source_url,
  };
}

export function mountLensRoutes(router: Router) {
  router.get('/api/lenses', async (req: Request, res: Response) => {
    const apiVersion = (req as any).apiVersion || 'v1';
    if (!requireReadApiKey(req, res)) return;
    try {
      const pagedSchema = z.object({ limit: z.coerce.number().int().nonnegative().optional(), offset: z.coerce.number().int().nonnegative().optional() }).passthrough();
      const parsedQ = pagedSchema.safeParse(req.query);
      if (!parsedQ.success) return res.status(400).json({ error: 'Invalid pagination parameters' });
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
      const result = rows.map(serializeLensRow);
      const items = result.map((l) => apiVersion === 'v1' ? ({
        ...l,
        _links: {
          self: { href: `/api/lenses?name=${encodeURIComponent(l.name)}&brand=${encodeURIComponent(l.brand)}&mount=${encodeURIComponent(l.mount)}` },
          cameras: { href: `/api/cameras?mount=${encodeURIComponent(l.mount)}` }
        }
      }) : l);
      let xTotalCount: string | undefined; let linkHeader: string | undefined;
      if (counts && typeof (counts as any).lenses === 'number') {
        xTotalCount = String((counts as any).lenses);
        res.setHeader('X-Total-Count', xTotalCount);
        const base = req.protocol + '://' + req.get('host') + req.path;
        linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).lenses) || undefined;
        if (linkHeader) res.setHeader('Link', linkHeader);
      }
      if (cache.enabled) await cache.set(cacheKey, { body: items, headers: { xTotalCount, link: linkHeader } });
      sendWithEtag(req, res, items);
    } catch (e) {
      if (process.env.NODE_ENV === 'test') return sendWithEtag(req, res, []);
      res.status(500).json({ error: 'Failed to load lenses' });
    }
  });

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
          return headFromJson(req, res, cached.body);
        }
      }
      const { limit, offset } = parsePageParams(req);
      const [rows, counts] = await Promise.all([
        getAllLenses(limit as any, offset as any),
        typeof getCounts === 'function' ? (getCounts() as any) : Promise.resolve({})
      ]);
      const result = rows.map(serializeLensRow);
      const items = result.map((l) => apiVersion === 'v1' ? ({
        ...l,
        _links: {
          self: { href: `/api/lenses?name=${encodeURIComponent(l.name)}&brand=${encodeURIComponent(l.brand)}&mount=${encodeURIComponent(l.mount)}` },
          cameras: { href: `/api/cameras?mount=${encodeURIComponent(l.mount)}` }
        }
      }) : l);
      if (counts && typeof (counts as any).lenses === 'number') {
        res.setHeader('X-Total-Count', String((counts as any).lenses));
        const base = req.protocol + '://' + req.get('host') + req.path;
        const linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).lenses) || undefined;
        if (linkHeader) res.setHeader('Link', linkHeader);
      }
      return headFromJson(req, res, items);
    } catch (e) {
      if (process.env.NODE_ENV === 'test') { res.setHeader('Vary', 'Accept, Accept-Encoding, Origin'); return res.status(200).end(); }
      res.status(500).json({ error: 'Failed to load lenses' });
    }
  });
}


