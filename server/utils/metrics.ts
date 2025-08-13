import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const metrics = {
  paginationRequests: new client.Counter({
    name: 'lf_pagination_requests_total', help: 'Pagination requests', registers: [register]
  }),
  authHits: new client.Counter({
    name: 'lf_auth_hits_total', help: 'Auth guard hits', registers: [register], labelNames: ['result'] as const
  }),
  idempotency: new client.Counter({
    name: 'lf_idempotency_events_total', help: 'Idempotency events', registers: [register], labelNames: ['event'] as const
  }),
  cacheGets: new client.Counter({
    name: 'lf_cache_get_total', help: 'Cache get calls', registers: [register]
  }),
  cacheHits: new client.Counter({
    name: 'lf_cache_hit_total', help: 'Cache hits', registers: [register]
  }),
  cacheMisses: new client.Counter({
    name: 'lf_cache_miss_total', help: 'Cache misses', registers: [register]
  }),
  cacheSets: new client.Counter({
    name: 'lf_cache_set_total', help: 'Cache set calls', registers: [register]
  }),
  cacheDeletes: new client.Counter({
    name: 'lf_cache_delete_total', help: 'Cache delete calls (by prefix aggregated)', registers: [register]
  }),
  redisConnected: new client.Gauge({
    name: 'lf_redis_connected', help: 'Redis client connection state (1=ready,0=down)', registers: [register]
  }),
  redisErrors: new client.Counter({
    name: 'lf_redis_errors_total', help: 'Redis client error events', registers: [register]
  })
};

export function getMetricsRegister() {
  return register;
}


