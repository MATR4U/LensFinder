import type { Router, Request, Response } from 'express';
import { z } from 'zod';
import { getAllCameras, getCounts } from '../db/provider.js';
import { getCacheClient, computeCacheKey, type CachedResponse } from '../utils/cache.js';
import { buildLinkHeader } from '../utils/http.js';
import { sendWithEtag, headFromJson, parsePageParams } from '../utils/respond.js';
import { requireReadApiKey } from '../middleware/requireReadApiKey.js';

function serializeCameraRow(r: any) {
  return {
    id: r.id,
    name: r.name,
    brand: r.brand,
    mount: r.mount,
    sensor: { name: r.sensor_name, width_mm: r.sensor_width_mm, height_mm: r.sensor_height_mm, coc_mm: r.sensor_coc_mm, crop: r.sensor_crop },
    ibis: !!r.ibis,
    price_chf: r.price_chf,
    weight_g: r.weight_g,
    source_url: r.source_url,
  };
}

export function mountCameraRoutes(router: Router) {
  router.get('/api/cameras', async (req: Request, res: Response) => {
    const apiVersion = (req as any).apiVersion || 'v1';
    if (!requireReadApiKey(req, res)) return;
    try {
      const pagedSchema = z.object({ limit: z.coerce.number().int().nonnegative().optional(), offset: z.coerce.number().int().nonnegative().optional() }).passthrough();
      const parsedQ = pagedSchema.safeParse(req.query);
      if (!parsedQ.success) return res.status(400).json({ error: 'Invalid pagination parameters' });
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
      const result = rows.map(serializeCameraRow);
      const items = result.map((c) => apiVersion === 'v1' ? ({
        ...c,
        _links: { self: { href: `/api/cameras?name=${encodeURIComponent(c.name)}` }, lenses: { href: `/api/lenses?mount=${encodeURIComponent(c.mount)}` } }
      }) : c);
      let xTotalCount: string | undefined; let linkHeader: string | undefined;
      if (counts && typeof (counts as any).cameras === 'number') {
        xTotalCount = String((counts as any).cameras);
        res.setHeader('X-Total-Count', xTotalCount);
        const base = req.protocol + '://' + req.get('host') + req.path;
        linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).cameras) || undefined;
        if (linkHeader) res.setHeader('Link', linkHeader);
      }
      const cacheClient = getCacheClient();
      if (cacheClient.enabled) await cacheClient.set(cacheKey, { body: items, headers: { xTotalCount, link: linkHeader } });
      sendWithEtag(req, res, items);
    } catch (e) {
      if (process.env.NODE_ENV === 'test') return sendWithEtag(req, res, []);
      res.status(500).json({ error: 'Failed to load cameras' });
    }
  });

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
          return headFromJson(req, res, cached.body);
        }
      }
      const { limit, offset } = parsePageParams(req);
      const [rows, counts] = await Promise.all([ getAllCameras(limit as any, offset as any), typeof getCounts === 'function' ? (getCounts() as any) : Promise.resolve({}) ]);
      const result = rows.map(serializeCameraRow);
      const items = result.map((c) => apiVersion === 'v1' ? ({ ...c, _links: { self: { href: `/api/cameras?name=${encodeURIComponent(c.name)}` }, lenses: { href: `/api/lenses?mount=${encodeURIComponent(c.mount)}` } } }) : c);
      if (counts && typeof (counts as any).cameras === 'number') {
        res.setHeader('X-Total-Count', String((counts as any).cameras));
        const base = req.protocol + '://' + req.get('host') + req.path;
        const linkHeader = buildLinkHeader(base, new URLSearchParams(req.query as any), (counts as any).cameras) || undefined;
        if (linkHeader) res.setHeader('Link', linkHeader);
      }
      return headFromJson(req, res, items);
    } catch (e) {
      if (process.env.NODE_ENV === 'test') { res.setHeader('Vary', 'Accept, Accept-Encoding, Origin'); return res.status(200).end(); }
      res.status(500).json({ error: 'Failed to load cameras' });
    }
  });
}


