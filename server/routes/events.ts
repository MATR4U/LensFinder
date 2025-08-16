import type { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import { problem } from '../utils/http.js';
import { config } from '../config.js';

export function mountEventRoutes(router: Router) {
  const sseClients = new Map<string, Response>();
  function writeSse(res: Response, event: string, data: unknown) {
    try { res.write(`event: ${event}\n`); res.write(`data: ${JSON.stringify(data)}\n\n`); } catch {}
  }

  router.get('/api/events', (req: Request, res: Response) => {
    const onceParam = (req.query as any).once;
    if (onceParam !== undefined) {
      const onceSchema = z.object({ once: z.coerce.number().int().min(0).max(1) }).passthrough();
      const parsed = onceSchema.safeParse({ once: onceParam });
      if (!parsed.success) return problem(res, 400, 'Bad Request', 'Invalid once parameter');
    }
    const secret = config.requestSignatureSecret;
    if (secret) {
      const tsHeader = String((req.query as any).ts || '').trim();
      const sigHeader = String((req.query as any).sig || '').trim();
      if (!tsHeader || !sigHeader) return problem(res, 401, 'Unauthorized');
      const now = Date.now();
      let tsMs: number | null = null;
      const asNumber = Number(tsHeader);
      if (Number.isFinite(asNumber)) tsMs = asNumber > 10_000_000_000 ? Math.floor(asNumber) : Math.floor(asNumber * 1000);
      else { const parsed = Date.parse(tsHeader); tsMs = Number.isFinite(parsed) ? parsed : null; }
      if (!tsMs) return problem(res, 401, 'Unauthorized', 'Invalid timestamp');
      if (Math.abs(now - tsMs) > (config.signatureTtlSeconds * 1000)) return problem(res, 401, 'Unauthorized', 'Signature expired');
      const mac = crypto.createHmac('sha256', secret).update(tsHeader + '.' + req.path).digest('hex');
      const a = new Uint8Array(Buffer.from(sigHeader, 'hex'));
      const b = new Uint8Array(Buffer.from(mac, 'hex'));
      if (a.byteLength !== b.byteLength || !crypto.timingSafeEqual(a, b)) return problem(res, 401, 'Unauthorized');
    }
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();
    const id = crypto.randomUUID();
    sseClients.set(id, res);
    res.write(`retry: 5000\n`);
    res.write(`: connected ${id}\n\n`);
    let seq = 0;
    const keepalive = setInterval(() => { writeSse(res, 'ping', { ts: Date.now(), n: seq++ }); }, 25000);
    const once = String((req.query as any).once || '').trim() === '1';
    if (once) { writeSse(res, 'ping', { ts: Date.now(), n: seq++ }); clearInterval(keepalive); sseClients.delete(id); return res.end(); }
    const cleanup = () => { clearInterval(keepalive); sseClients.delete(id); };
    req.on('close', cleanup); res.on('close', cleanup as any);
  });
  router.head('/api/events', (_req: Request, res: Response) => { res.status(200).end(); });
  router.get('/api/events/token', (_req: Request, res: Response) => {
    const secret = config.requestSignatureSecret; if (!secret) return res.status(204).end();
    const ts = Date.now(); const sig = crypto.createHmac('sha256', secret).update(String(ts) + '.' + '/api/events').digest('hex');
    res.json({ ts, sig });
  });
  router.head('/api/events/token', (_req: Request, res: Response) => { const secret = config.requestSignatureSecret; if (!secret) return res.status(204).end(); res.status(200).end(); });
}


