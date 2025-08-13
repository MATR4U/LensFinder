import type { Camera, Lens } from '../types';
import { clientConfig } from '../config';

type Cache<T> = {
  data: T | null;
  etag: string | null;
  lastFetched: number | null;
};

const camerasCache: Cache<Camera[]> = { data: null, etag: null, lastFetched: null };
const lensesCache: Cache<Lens[]> = { data: null, etag: null, lastFetched: null };

async function fetchWithEtag<T>(url: string, cache: Cache<T>): Promise<T> {
  const headers: Record<string, string> = {};
  if (cache.etag) headers['If-None-Match'] = cache.etag;
  const res = await fetch(url, { headers });
  if (res.status === 304 && cache.data) {
    return cache.data;
  }
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const etag = res.headers.get('ETag');
  const data = (await res.json()) as T;
  cache.data = data;
  cache.etag = etag;
  cache.lastFetched = Date.now();
  return data;
}

export async function getCamerasCached(): Promise<Camera[]> {
  if (camerasCache.data) return camerasCache.data;
  return fetchWithEtag<Camera[]>('/api/cameras', camerasCache);
}

export async function getLensesCached(): Promise<Lens[]> {
  if (lensesCache.data) return lensesCache.data;
  return fetchWithEtag<Lens[]>('/api/lenses', lensesCache);
}

export function onDataInvalidated(cb: () => void) {
  // Prefer SSE; fall back to 60s polling
  let stopped = false;
  let source: EventSource | null = null;
  try {
    const base = (clientConfig.apiBaseUrl || '').replace(/\/$/, '');
    let url = base ? `${base}/api/events` : '/api/events';
    // Fetch signed token if server is configured for it; tolerate 204/no body
    // Wrap in IIFE because this block is not async
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      try {
        const tokenRes = await fetch((base ? `${base}/api/events/token` : '/api/events/token'));
        if (tokenRes.ok) {
          const token = await tokenRes.json().catch(() => null) as any;
          if (token && token.ts && token.sig) {
            const qs = new URLSearchParams({ ts: String(token.ts), sig: String(token.sig) });
            url += (url.includes('?') ? '&' : '?') + qs.toString();
          }
        }
      } catch {}
      source = new EventSource(url);
      const handler = () => { if (!stopped) cb(); };
      source.addEventListener('ping', handler);
      source.addEventListener('report', handler);
      source.onerror = () => {
        try { source?.close(); } catch {}
        source = null;
      };
    })();
  } catch (_) {
    source = null;
  }

  let pollTimer: any;
  async function pollTick() {
    if (stopped) return;
    try {
      await fetchWithEtag('/api/cameras', camerasCache);
      await fetchWithEtag('/api/lenses', lensesCache);
      cb();
    } catch (_) {
    } finally {
      if (!stopped) pollTimer = setTimeout(pollTick, 60000);
    }
  }
  if (!source) pollTimer = setTimeout(pollTick, 60000);

  return () => {
    stopped = true;
    if (source) try { source.close(); } catch {}
    if (pollTimer) clearTimeout(pollTimer);
  };
}

// Expose cache metadata for read-only mode and diagnostics
export function getCacheMeta() {
  return {
    camerasLastFetched: camerasCache.lastFetched,
    lensesLastFetched: lensesCache.lastFetched
  } as const;
}

// Get a snapshot of last-known data without fetching (may be nulls)
export function getCachedSnapshot() {
  return {
    cameras: camerasCache.data,
    lenses: lensesCache.data
  } as const;
}


