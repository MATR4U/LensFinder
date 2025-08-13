# LensFinder

## Production deployment (Docker Compose)

Run the full stack (client build, server, Postgres, pgAdmin) with a single command:

```bash
cp env.prod.example .env.prod

# Generate deployment assets (single source of truth: .env.prod)
npm run deploy:gen

# Bring up full stack
docker compose -f infra/docker/docker-compose.yml --env-file .env.prod up -d --build
```

## Kubernetes deployment (Kustomize)

Prerequisites: build and push images `lensfinder-client:latest` and `lensfinder-server:latest` to a registry accessible by your cluster, or use `imagePullPolicy: Never` with a local cluster like kind/minikube and load images manually.

```bash
# Optional: set custom host in ingress (default lensfinder.local). Edit infra/k8s/ingress.yaml or /etc/hosts.

# Regenerate deployment assets from env (single source of truth)
npm run deploy:gen

# Create namespace and deploy all
kubectl apply -k infra/k8s/

# Verify
kubectl -n lensfinder get pods,svc,ingress

# Port-forward if no ingress
kubectl -n lensfinder port-forward svc/client 8080:3000
kubectl -n lensfinder port-forward svc/server 8081:3001
```

Services:

- server: Node API (serves built client), exposes `${PORT}` (3001 default)
- postgres: Postgres 16 with persistent volume
- pgadmin: optional admin UI on port 5050

Stop and remove volumes:

```bash
docker compose -f infra/docker/docker-compose.yml --env-file .env.prod down -v
docker compose -f infra/docker/docker-compose.client.yml down -v
docker compose -f infra/docker/docker-compose.db.yml down -v
docker compose -f infra/docker/docker-compose.server.yml down -v
```

Environment (centralized):

- Use `.env.dev` for development, `.env.prod` for production. These files are the source of truth for Docker/K8s.
- `DATABASE_URL` must be set (no hardcoded fallbacks in generation scripts). In Docker, point to `postgres`: `postgres://lens:lens@postgres:5432/lensfinder`.
- Client uses same-origin by default. Set `VITE_API_BASE_URL` in env to override.

## Overview

Lean tool to explore camera and lens options and generate reports. Frontend is Vite + React + TypeScript; backend is Express. Database is Postgres in all environments.

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+

## Monorepo layout

- `client/`: Vite + React app
- `server/`: Express API with pluggable DB
- `db/`: database assets (seed JSON in `db/data/`, Docker Compose for Postgres)

## Install

```bash
npm install
```

## Database

- Seed JSON lives in `db/data/`.
- Postgres (via Docker)
  - Bring up/down and view logs:
    - `npm run db:up`
    - `npm run db:logs`
    - `npm run db:down`
  - Migrate/seed from JSON: `npm run db:migrate` (reads `DATABASE_URL` from env).

## Run in development

Runs API first, then client for HMR; kills any prior servers on the ports.

```bash
npm run dev
```

Explicit startup:

```bash
npm run dev:server:pg
npm run dev:client
```

Dev servers:

- API: `http://localhost:${PORT}` (default 3001)
- Client: `http://localhost:${CLIENT_PORT}` (default 3000)

### Dev redeploy

- Regenerate manifests from `.env.dev`:
  - `npm run deploy:gen:dev`
- Docker Compose dev stack:
  - `docker compose -f infra/docker/docker-compose.yml --env-file .env.dev up -d --build`
- Kubernetes dev namespace:
  - `kubectl apply -k infra/k8s/`
  - On code changes: `kubectl rollout restart deploy/server && kubectl rollout restart deploy/client`

## Production build

```bash
npm run build
```

Start production servers (serves built client from server):

```bash
npm run start:ordered
```

## Tests and checks

Quick local pre-commit check:

```bash
npm run test:precommit
```

Full verification (build + unit + e2e; e2e skipped when Docker not running):

```bash
npm run ci:verify
```

## Server-only commands

From the `server/` workspace:

- `npm run dev` – start API with tsx (Postgres)

## Notes

- The API preserves the original JSON response shapes:
  - `GET /api/cameras` – list of cameras
  - `GET /api/lenses` – list of lenses
  - `POST /api/report` – derives a report from ranked lens items
- Data sources are defined in `db/data/*.json`; the migrate script is idempotent.

## API contracts: OpenAPI and GraphQL

- **REST + OpenAPI**:
  - The server auto-generates an OpenAPI spec from the current Postgres schema before tests via `server/scripts/generate-openapi.ts`.
  - Spec output: `server/openapi.json`.
  - Generate manually:

    ```bash
    cd server && npm run openapi
    ```

  - Suggested client usage (optional):
    - Generate TS types/client from `openapi.json` (e.g., `openapi-typescript`, `orval`, `swagger-typescript-api`).
    - Validate responses at runtime using `openapi-zod-client` if stricter guarantees are needed.
  - View docs: `GET /docs` (Swagger UI and Redoc) or `GET /openapi.json`.

- **GraphQL**:
  - GraphQL is available alongside REST at `POST /graphql`.
  - In development, GraphiQL is available at `GET /graphiql`.
  - Example query:

    ```bash
    curl -s http://localhost:3001/graphql \
      -H 'Content-Type: application/json' \
      -d '{"query":"{ cameras { name brand mount sensor { name width_mm height_mm } } }"}'
    ```

  - Example mutation:

    ```bash
    curl -s http://localhost:3001/graphql \
      -H 'Content-Type: application/json' \
      -d '{"query":"mutation($cam:String!,$goal:String!,$top:[ReportItemInput!]!){ report(cameraName:$cam, goal:$goal, top:$top){ cameraName goal items { name rank } }}","variables": {"cam":"A","goal":"B","top":[{"name":"L1","total":90,"weight_g":1000,"price_chf":2000,"type":"zoom"}]}}'
    ```

  - Suggested client usage (optional):
    - Use `@graphql-codegen/*` to generate typed operations and hooks from a `.graphql` documents set.

### Tests and isolated DB schema for integration

- **Server tests** cover REST and GraphQL endpoints.
- **DB-backed tests** create a timestamped schema per run (e.g., `lf_test_1699999999999`), seed minimal `cameras`/`lenses`, set `search_path` for the server pool, and drop/prune old schemas (keeps the 10 most recent).
- **Mock-based tests** are kept for fast unit runs (no DB dependency) and run in parallel with DB tests.

### Versioning

- REST endpoints are also accessible under `/v1/*` as a stable alias. Deprecations will follow a minor version deprecation notice before removal.
