import type { Router, Request, Response } from 'express';
import { z } from 'zod';
import { problem } from '../utils/http.js';
import { config } from '../config.js';

export function mountPriceRoutes(router: Router) {
  router.get('/api/price', async (req: Request, res: Response) => {
    const priceQuerySchema = z.object({ url: z.string().url() });
    const parsed = priceQuerySchema.safeParse({ url: req.query.url });
    if (!parsed.success) return problem(res, 400, 'Bad Request', 'Invalid or missing url parameter');
    try {
      const url = parsed.data.url;
      let parsedUrl: URL;
      try { parsedUrl = new URL(url); } catch { return problem(res, 400, 'Bad Request', 'Invalid URL'); }
      if (!/^https?:$/.test(parsedUrl.protocol)) return problem(res, 400, 'Bad Request', 'Only http(s) URLs allowed');
      if (config.priceScrapeAllowlist.length > 0) {
        const hostAllowed = config.priceScrapeAllowlist.some((h: string) => parsedUrl.host.endsWith(h));
        if (!hostAllowed) return problem(res, 403, 'Forbidden', 'Domain not allowed');
      }
      try {
        const dns = await import('dns/promises');
        const addrs = await dns.lookup(parsedUrl.hostname, { all: true });
        const blocked = addrs.some((a) => {
          const ip = a.address;
          if (/^10\./.test(ip) || /^192\.168\./.test(ip) || /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) || ip === '127.0.0.1') return true;
          if (ip === '::1') return true;
          if (/^(fc|fd)[0-9a-f]{2}:/i.test(ip)) return true;
          if (/^fe8[0-9a-f]:/i.test(ip)) return true;
          return false;
        });
        if (blocked) return problem(res, 403, 'Forbidden', 'Target IP not allowed');
      } catch {}
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);
      const resp = await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'LensFinderBot/1.0 (+https://example.com)' } }).finally(() => clearTimeout(timeout));
      const reader = resp.body?.getReader();
      let received = 0; let html = '';
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break; received += value.length; if (received > 512_000) return problem(res, 413, 'Payload Too Large', 'Response too large');
          html += new TextDecoder().decode(value);
        }
      } else { html = await resp.text(); if (html.length > 512_000) return problem(res, 413, 'Payload Too Large', 'Response too large'); }
      const { load } = await import('cheerio');
      const $ = load(html);
      const candidates = [ $('[itemprop="price"]').attr('content'), $('[data-price]').attr('data-price'), $('[class*="price" i]').first().text(), $('meta[property="product:price:amount"]').attr('content') ].filter(Boolean) as string[];
      const raw = candidates.find(Boolean) || '';
      const match = raw.replace(/\s+/g, ' ').match(/([\d'.,]+)\s*(CHF|EUR|USD)?/i);
      const normalized = match ? `${match[2] ? match[2].toUpperCase() + ' ' : ''}${match[1]}` : null;
      res.json({ price: normalized });
    } catch {
      problem(res, 500, 'Internal Server Error', 'Failed to fetch price');
    }
  });
  router.head('/api/price', async (req: Request, res: Response) => {
    const priceQuerySchema = z.object({ url: z.string().url() });
    const parsed = priceQuerySchema.safeParse({ url: req.query.url });
    if (!parsed.success) return problem(res, 400, 'Bad Request', 'Invalid or missing url parameter');
    res.type('application/json').status(200).end();
  });
}


