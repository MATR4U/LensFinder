import type { Request, Response } from 'express';
import crypto from 'crypto';

export function sendWithEtag(req: Request, res: Response, payload: unknown) {
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

export function headFromJson(req: Request, res: Response, payload: unknown) {
  const body = JSON.stringify(payload);
  const etag = 'W/"' + crypto.createHash('sha1').update(body).digest('hex') + '"';
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
  res.status(200).end();
}

export function parsePageParams(req: Request) {
  const limit = req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const offset = req.query.offset !== undefined ? Number(req.query.offset) : undefined;
  const safeLimit = typeof limit === 'number' && Number.isFinite(limit) ? Math.min(Math.max(0, Math.floor(limit)), 500) : undefined;
  const safeOffset = typeof offset === 'number' && Number.isFinite(offset) ? Math.max(0, Math.floor(offset)) : undefined;
  return { limit: safeLimit, offset: safeOffset };
}


