import type { Request, Response, Router } from 'express';
import express from 'express';

export function mountIndexRoutes(router: Router) {
  // Service index for discoverability
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
  router.head('/api', (_req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
    res.type('application/json').status(200).end();
  });
}


