import type { Request, Response, Router } from 'express';
import express from 'express';
import { z } from 'zod';
import { problem } from '../utils/http.js';
import { sendWithEtag } from '../utils/respond.js';

export function mountRecommendationRoutes(router: Router) {
  const r = express.Router();

  const schema = z.object({
    lensMount: z.string().min(1),
    budget: z.object({
      target: z.number().int().nonnegative().default(1500),
      isFlexible: z.boolean().default(true),
    }),
    useCases: z.array(z.string()).default([]),
    priorities: z.object({
      portability: z.number().int().min(1).max(5).default(3),
      lowLight: z.number().int().min(1).max(5).default(3),
      zoom: z.number().int().min(1).max(5).default(3),
    }),
  });

  r.post('/api/v1/lenses/recommendations', async (req: Request, res: Response) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return problem(res, 400, 'Bad Request', 'Invalid request body');
    try {
      const base = process.env.RECOMMENDER_URL?.trim() || 'http://localhost:3100';
      const url = `${base.replace(/\/+$/, '')}/recommendations`;
      const upstream = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      if (!upstream.ok) {
        return problem(res, upstream.status, 'Upstream Error', 'Failed to compute recommendations');
      }
      const body = await upstream.json();
      return sendWithEtag(req, res, body);
    } catch (e) {
      return problem(res, 500, 'Internal Server Error', 'Failed to compute recommendations');
    }
  });

  router.use(r);
}
