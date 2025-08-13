#!/usr/bin/env bash
set -euo pipefail

echo "[entrypoint] NODE_ENV=${NODE_ENV:-} PORT=${PORT:-}"

# Default DATABASE_URL to service hostname if not supplied
export DATABASE_URL=${DATABASE_URL:-postgres://lens:lens@postgres:5432/lensfinder}

echo "[entrypoint] Waiting for database tcp postgres:5432..."
until (</dev/tcp/postgres/5432) >/dev/null 2>&1; do sleep 1; done

echo "[entrypoint] Running migrations and seeding data"
cd /app/server
node ../db/migrate.cjs || true

echo "[entrypoint] Starting server"
cd /app/server
node ./dist/index.js


