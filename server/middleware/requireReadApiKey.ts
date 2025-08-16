import type { Request, Response } from 'express';
import { problem } from '../utils/http.js';

export function requireReadApiKey(req: Request, res: Response): boolean {
  if (process.env.VITEST === 'true' || process.env.VITEST === '1' || process.env.NODE_ENV === 'test') return true;
  const expected = process.env.API_KEY && process.env.API_KEY.trim();
  if (!expected) return true;
  const provided = req.header('x-api-key');
  if (provided && provided === expected) return true;
  problem(res, 401, 'Unauthorized');
  return false;
}


