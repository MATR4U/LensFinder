# Redis for LensFinder

This folder documents the optional Redis cache used by the server. The app runs without Redis; enabling it reduces DB load and speeds up read endpoints.

Usage options:

- Docker Compose (default): service `redis` is defined in `infra/docker/docker-compose.db.yml` and wired at the root level. Start with:

```bash
docker compose up -d redis
```

Set `REDIS_URL=redis://redis:6379/0` for other services in Compose.

- Kubernetes: a simple `redis` `Deployment` + `Service` is provided in `infra/k8s/redis.yaml`. The server `ConfigMap` defaults `REDIS_URL` to `redis://redis:6379/0`.

Environment variables:

- `REDIS_URL` (e.g. `redis://localhost:6379/0`)
- `CACHE_TTL_S` default 300

Invalidate cache:

POST `/api/cache/purge` with JSON `{ "prefixes": ["cameras:", "lenses:"] }` and headers `x-timestamp` and `x-signature` (HMAC-SHA256 of `timestamp.body` with `REQUEST_SIGNATURE_SECRET`).
