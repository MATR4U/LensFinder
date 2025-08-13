# syntax=docker/dockerfile:1.7-labs

# --- Build server ---
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci && npm cache clean --force
COPY server .
# Attempt to generate OpenAPI during build; fallback to minimal file if DB unavailable
RUN npm run openapi || node -e "require('fs').writeFileSync('openapi.json','{}')"
RUN npm run build

# --- Runtime image ---
FROM node:20-alpine AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Install lightweight deps for healthchecks and psql client if needed
RUN apk add --no-cache bash curl

# Copy server dist and production deps
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/openapi.json ./server/openapi.json
RUN cd server && npm ci --omit=dev && npm cache clean --force

# Copy db migration tool (compiled via tsx at runtime) and data/sql files
COPY db ./db

# Entrypoint: run migrations then start server
COPY server/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

USER app

CMD ["./entrypoint.sh"]


