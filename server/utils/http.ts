import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { config } from '../config.js';

export function problem(res: Response, status: number, title: string, detail?: string, type = 'about:blank') {
  res.status(status)
    .type('application/problem+json')
    .json({ type, title, status, detail });
}

export function withCorrelationId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-correlation-id');
  const id = incoming && incoming.trim() ? incoming : crypto.randomUUID();
  (req as any).correlationId = id;
  res.setHeader('x-correlation-id', id);
  next();
}

export function parseAcceptVersion(req: Request): string {
  // Prefer explicit path-based version like /v1/* when mounted
  const base = (req.baseUrl || '').toLowerCase();
  const baseMatch = base.match(/^\/v(\d+)/);
  if (baseMatch) return `v${baseMatch[1]}`;
  const accept = req.header('accept') || '';
  const m = accept.match(/application\/vnd\.lensfinder\.v(\d+)\+json/i);
  if (m) return `v${m[1]}`;
  return (config.apiVersioning?.current || 'v1');
}

export function requireApiVersion(req: Request, res: Response, next: NextFunction) {
  const version = parseAcceptVersion(req);
  (req as any).apiVersion = version;
  res.setHeader('api-version', version);
  const deprecated = !!config.apiVersioning?.deprecated?.includes(version);
  res.setHeader('Deprecation', deprecated ? 'true' : 'false');
  if (deprecated) {
    const sunset = config.apiVersioning?.sunsets?.[version];
    if (sunset) res.setHeader('Sunset', sunset);
    const policy = config.apiVersioning?.policyUrl;
    if (policy) {
      res.setHeader('Deprecation-Policy', policy);
      // Also advertise policy via Link header as per recommendations
      try { (res as any).append ? (res as any).append('Link', `<${policy}>; rel="deprecation"`) : res.setHeader('Link', `<${policy}>; rel="deprecation"`); } catch {}
    }
  }
  next();
}

export function setVersionHeaders(req: Request, res: Response) {
  const version = parseAcceptVersion(req);
  res.setHeader('api-version', version);
  const deprecated = !!config.apiVersioning?.deprecated?.includes(version);
  res.setHeader('Deprecation', deprecated ? 'true' : 'false');
  if (deprecated) {
    const sunset = config.apiVersioning?.sunsets?.[version];
    if (sunset) res.setHeader('Sunset', sunset);
    const policy = config.apiVersioning?.policyUrl;
    if (policy) res.setHeader('Deprecation-Policy', policy);
  }
}

export function buildLinkHeader(baseUrl: string, params: URLSearchParams, total: number) {
  const limit = Number(params.get('limit') || '0');
  const offset = Number(params.get('offset') || '0');
  const cursor = params.get('cursor');
  let effOffset = offset;
  if (cursor && !Number.isFinite(offset)) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const m = decoded.match(/^offset:(\d+)$/);
      if (m) effOffset = Number(m[1]);
    } catch {}
  }
  const links: string[] = [];
  const urlWith = (o: number) => {
    const p = new URLSearchParams(params);
    p.set('offset', String(o));
    if (!p.get('limit') && limit) p.set('limit', String(limit));
    return `${baseUrl}?${p.toString()}`;
  };
  if (limit > 0) {
    links.push(`<${urlWith(effOffset)}>; rel="self"`);
    if (effOffset + limit < total) links.push(`<${urlWith(effOffset + limit)}>; rel="next"`);
    if (effOffset > 0) links.push(`<${urlWith(Math.max(0, effOffset - limit))}>; rel="prev"`);
    links.push(`<${urlWith(Math.max(0, Math.floor((total - 1) / limit) * limit))}>; rel="last"`);
    links.push(`<${urlWith(0)}>; rel="first"`);
  }
  return links.join(', ');
}

export type IdempotencyStore = {
  get: (key: string) => any | undefined;
  set: (key: string, value: any) => void;
};

export function createInMemoryIdempotency(ttlMs: number, maxEntries = 1000): IdempotencyStore {
  const map = new Map<string, { v: any; t: number }>();
  function sweep() {
    const now = Date.now();
    for (const [k, o] of map) { if (now - o.t > ttlMs) map.delete(k); }
    while (map.size > maxEntries) {
      const first = map.keys().next().value as string | undefined;
      if (!first) break;
      map.delete(first);
    }
  }
  return {
    get(key) { sweep(); return map.get(key)?.v; },
    set(key, value) { map.set(key, { v: value, t: Date.now() }); sweep(); }
  };
}

export function createHmacVerifier(secret?: string) {
  return function verify(req: Request): boolean {
    if (!secret) return true;
    const sig = req.header('x-signature');
    const ts = req.header('x-timestamp');
    if (!sig || !ts) return false;
    const raw = (req as any).rawBody as string | undefined;
    const body = typeof raw === 'string' ? raw : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
    const mac = crypto.createHmac('sha256', secret).update(ts + '.' + body).digest('hex');
    const a = new Uint8Array(Buffer.from(sig, 'hex'));
    const b = new Uint8Array(Buffer.from(mac, 'hex'));
    if (a.byteLength !== b.byteLength) return false;
    return crypto.timingSafeEqual(a, b);
  };
}

export function createSignatureMiddleware(secret: string | undefined, ttlSeconds: number, excludePaths?: string[]) {
  const verify = createHmacVerifier(secret);
  const excluded = (excludePaths || []).map(p => p.trim()).filter(Boolean);
  return function requireSignature(req: Request, res: Response, next: NextFunction) {
    if (!secret) return next();
    const path = req.path || req.url || '';
    if (excluded.some(p => p === path)) return next();
    const method = (req.method || 'GET').toUpperCase();
    // Enforce only on mutating methods
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next();
    const tsHeader = req.header('x-timestamp');
    const sigHeader = req.header('x-signature');
    if (!tsHeader || !sigHeader) {
      return problem(res, 401, 'Unauthorized', 'Missing signature headers');
    }
    const now = Date.now();
    let tsMs: number | null = null;
    const asNumber = Number(tsHeader);
    if (Number.isFinite(asNumber)) {
      // Heuristic: seconds vs milliseconds
      tsMs = asNumber > 10_000_000_000 ? Math.floor(asNumber) : Math.floor(asNumber * 1000);
    } else {
      const parsed = Date.parse(tsHeader);
      tsMs = Number.isFinite(parsed) ? parsed : null;
    }
    if (!tsMs) {
      return problem(res, 401, 'Unauthorized', 'Invalid timestamp');
    }
    if (Math.abs(now - tsMs) > ttlSeconds * 1000) {
      return problem(res, 401, 'Unauthorized', 'Signature expired');
    }
    if (!verify(req)) {
      return problem(res, 401, 'Unauthorized', 'Invalid signature');
    }
    next();
  };
}


