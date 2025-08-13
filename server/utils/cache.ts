import { config } from '../config.js';
import { metrics } from './metrics.js';

type CachedHeaders = {
  xTotalCount?: string;
  link?: string;
};

export type CachedResponse<T = unknown> = {
  body: T;
  headers?: CachedHeaders;
};

type CacheClient = {
  get: <T = unknown>(key: string) => Promise<CachedResponse<T> | null>;
  set: <T = unknown>(key: string, value: CachedResponse<T>, ttlSeconds?: number) => Promise<void>;
  delPrefix: (prefix: string) => Promise<number>;
  enabled: boolean;
};

let _client: CacheClient | null = null;

export function getCacheClient(): CacheClient {
  if (_client) return _client;
  const url = process.env.REDIS_URL || '';
  if (!url) {
    _client = {
      enabled: false,
      async get() { return null; },
      async set() { /* no-op */ },
      async delPrefix() { return 0; }
    };
    return _client;
  }
  // Dynamically require to keep optional without type dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const IORedis: any = require('ioredis');
  const redis: any = new IORedis(url);
  redis.on('ready', () => { try { metrics.redisConnected.set(1); } catch {} });
  redis.on('end', () => { try { metrics.redisConnected.set(0); } catch {} });
  redis.on('error', () => { try { metrics.redisErrors.inc(); metrics.redisConnected.set(0); } catch {} });
  _client = {
    enabled: true,
    async get<T = unknown>(key: string): Promise<CachedResponse<T> | null> {
      try { metrics.cacheGets.inc(); } catch {}
      const raw = await redis.get(key);
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw) as CachedResponse<T>;
        try { metrics.cacheHits.inc(); } catch {}
        return parsed;
      } catch {
        try { metrics.cacheMisses.inc(); } catch {}
        return null;
      }
    },
    async set<T = unknown>(key: string, value: CachedResponse<T>, ttlSeconds?: number) {
      const ttl = typeof ttlSeconds === 'number' ? ttlSeconds : config.cacheTtlSeconds;
      await redis.set(key, JSON.stringify(value), 'EX', Math.max(1, ttl));
      try { metrics.cacheSets.inc(); } catch {}
    },
    async delPrefix(prefix: string) {
      let cursor = '0';
      let total = 0;
      do {
        const [next, keys] = await redis.scan(cursor, 'MATCH', `${prefix}*`, 'COUNT', 500);
        cursor = next;
        if (keys.length > 0) total += await redis.del(...keys);
      } while (cursor !== '0');
      try { metrics.cacheDeletes.inc(total); } catch {}
      return total;
    }
  };
  return _client;
}

export function computeCacheKey(kind: string, reqUrl: string, params: Record<string, unknown> = {}): string {
  const base = reqUrl.split('?')[0];
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    p.set(k, String(v));
  }
  return `${kind}:${base}?${p.toString()}`;
}


