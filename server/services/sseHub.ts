import type { Response } from 'express';

const clients = new Map<string, Response>();

export function addClient(res: Response): { id: string; remove: () => void } {
  const id = (globalThis.crypto as any)?.randomUUID ? (globalThis.crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  clients.set(id, res);
  return { id, remove: () => { try { clients.delete(id); } catch {} } };
}

export function writeSse(res: Response, event: string, data: unknown) {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch {}
}

export function broadcast(event: string, data: unknown) {
  for (const [, res] of clients) writeSse(res, event, data);
}


