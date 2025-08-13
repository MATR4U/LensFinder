### Scope & Conventions

- This file is the single-source backlog for production-critical work only. Keep ideation and phased roadmap in `NEW-FEATURES.MD`.

#### Definition of Ready (applies to every item)

- Design note present (what/why, approach)
- Affected files/modules listed
- Required env vars/secrets identified (and where to set in Compose/K8s)
- Tests identified (server, client, e2e) and coverage target

#### Definition of Done (applies to every item)

- All tests green: `npm run test:server && npm run test:client && npm run test:e2e`
- 100% atomic coverage for changed areas
- Build passes: `npm run build`
- Pre-commit: run `npm run test:precommit` locally before committing
- Docs updated (README, API contracts) and infra/env manifests updated
- No defensive programming; strict, root-cause fixes
- No hardcoded config; all config sourced from `.env.*`

### Production TODOs (must be satisfied before release)

- CI [Status: Open]
- Optionally set `REDIS_URL=redis://localhost:6379/0` in CI to exercise cache paths.

- Kubernetes Redis persistence (optional) [Status: Open]
- Add PVC and mount `/data` for `infra/k8s/redis.yaml` if persistence is desired.

- **Client UI and e2e parity** [Status: In Progress]
  - Mode screen shows buttons labeled 'Beginner' and 'Pro'; can proceed via 'Continue'.
  - Requirements include checkboxes labeled exactly 'Weather sealed' and 'Macro'.
  - Results grid renders cards with `data-testid="lens-card"`; each card has a visible 'Select' button and a `[data-testid="compare-toggle"]` button that toggles to 'Remove'.
  - Default flow renders results promptly; client does not block UI on server health and fetches in background.
  - Affected: `client/src/components/flow/*`, `client/src/components/report/LensCard.tsx`, `client/src/pages/App.tsx`, store/selectors.
  - Progress: UI labels/controls aligned; compare grid always present for later stages; ARIA labels added; server serves built client for tests. Per workflow, e2e runs are deferred unless explicitly requested.
  - Tests: Fix failing e2e specs to green across Chromium/Firefox/WebKit/mobile-safari. [Deferred]

- **CORS** [Status: In Progress]
  - Lock `CORS_ALLOWED_ORIGINS` to production domains only. [Plumbed in env/examples/K8s]

- **Caching** [Status: Open]
- Configure Redis and `CACHE_TTL_SECONDS`. Verify cache client enabled in prod.
- Set `REQUEST_SIGNATURE_SECRET` and enforce HMAC on `/api/cache/purge`.

- CI: set `REDIS_URL=redis://localhost:6379/0` in both jobs to exercise cache path. [Open]

- **Observability** [Status: Open]
- Ensure `/metrics` is scraped by Prometheus; dashboards in Grafana.
- Set `LOG_LEVEL` appropriately; keep Pino redaction of auth/cookies.

- **Security** [Status: Open]
- Validate Helmet/CSP settings for production.
- Keep GraphiQL disabled in production (only enabled in non-prod).

- **Database (Postgres)** [Status: Open]
- `DATABASE_URL` configured; migrations run automatically on deploy.
- Backups and retention configured.

- **Kubernetes/Compose** [Status: In Progress]
- Resource requests/limits set for all services. [Done]
- Secrets created for `API_KEY`, `REQUEST_SIGNATURE_SECRET`, DB creds; not committed.
- Client env: `VITE_API_BASE_URL`, `VITE_API_KEY` set per environment.
- Propagate CORS/proxy/signature/version/rate-limit/body-size env across K8s and Compose. [Done]

- **Contracts and tests** [Status: Open]
- OpenAPI/GraphQL schemas generated in CI.
- Unit/integration/e2e tests green in CI across Chromium/Firefox/WebKit.
- Add tests for HMAC verification (valid/expired/malformed), middleware path exclusion, and cache purge endpoint auth + behavior.

- **Configuration hygiene** [Status: Open]
- All configuration comes from `.env.*`; no hardcoded secrets.
- Ensure infra manifests and compose files propagate `REDIS_URL`, `CACHE_TTL_S`, `REQUEST_SIGNATURE_SECRET`, `SIGNATURE_TTL_SECONDS`, and `API_KEY`.

- **Error handling (RFC 7807)** [Status: In Progress]
- Central Express error middleware added to emit `application/problem+json` consistently. [Done]
- Converted REST and GraphQL ad-hoc error responses to RFC7807 in server. [Done]
- Document error types and fields in API docs, and ensure tests cover negative cases. [Open]

- **Pagination (cursor-based)** [Status: Open]
- Add opaque cursor pagination for large collections; support both offset and cursor in a backward-compatible way.
- Update Link header builder and OpenAPI to describe cursor semantics and examples.

- **HATEOAS consistency** [Status: Open]
- Decide on representation (HAL vs JSON:API-style links) and apply `_links` consistently across collection and item responses.
- Document link relations and include top-level collection navigation links.

- **Idempotency (generalized)** [Status: Open]
- Extract reusable idempotency-key middleware; persist responses in Postgres for all mutating endpoints.
- Add retention/cleanup policy and comprehensive tests (hit/miss/set, expiry behavior).

- **Authentication/Authorization (token + roles)** [Status: Open]
- Introduce JWT/OAuth2 for write/admin endpoints; design RBAC scopes/claims; retain simple read API key where appropriate.
- Document token acquisition/refresh and required scopes per endpoint.

- **Caching policy (uniform + CDN)** [Status: Open]
- Standardize `Cache-Control`/ETag across endpoints; define `s-maxage`/`stale-while-revalidate` for CDN.
- Document cache hierarchy (browser/CDN/server), and align purge/invalidation flows with admin endpoints.

- **Event delivery breadth** [Status: Open]
- Add Webhooks with HMAC signatures and retry policy; optionally provide a WebSocket channel for real-time updates.
- Document SSE/Webhooks/WS usage, backoff, and security requirements.

  - **Request validation (schema-driven)** [Status: In Progress]
  - Validate all request payloads and query parameters using a centralized schema (e.g., Zod) and emit RFC7807 problem responses on validation failures. [Partial: `/api/price` query, `/api/report` body, and pagination params on `/api/cameras` and `/api/lenses` validated]
  - Document per-endpoint request/response schemas and align OpenAPI accordingly.

- **HTTP semantics (Vary/HEAD)** [Status: Done]
  - Standardize `Vary` headers (`Accept`, `Accept-Encoding`, and `Origin` when CORS is enabled) across cacheable endpoints. [Done]
  - Support `HEAD` for all `GET` resources returning identical headers and status with an empty body. [Done: `/api`, `/docs`, `/metrics`, `/openapi.json`, `/api/health`, `/api/health/components`, `/api/cameras`, `/api/lenses`, `/api/price`, `/api/events`, `/api/events/token`]

  - **HATEOAS affordances (beyond links)** [Status: In Progress]
  - Include hypermedia controls for writes (e.g., forms/templates or HAL-FORMS/Collection+JSON affordances) where applicable; document link relations and affordance semantics. [Partial: `_templates.report` added to `/api`]

### Nice-to-haves (post-GA)

- Externalize rate limits/body sizes to env with sane defaults.
- Emit API version sunset dates via `apiVersioning.sunsets` when planned.
- Expand cache purge tooling and audit logs.

- OAuth2/JWT and Roles/RBAC
  - Adopt OIDC provider and JWT access tokens with JWKS verification (issuer/audience checks).
  - Enforce roles/permissions via middleware and scoped claims; add role-based tests.

- Enforced header versioning
  - Require `Accept: application/vnd.lensfinder.vX+json`; return 406 when missing/unsupported.
  - Emit `Sunset`, `Deprecation`, and policy `Link` headers based on config.

- System-wide HATEOAS
  - Normalize `_links` across all REST resources (self, related, pagination) consistently.

- True cursor pagination
  - Replace offset with opaque, stable cursors; include `Link` headers with `next`/`prev` using cursors.

- Centralized error middleware and uniform problem+json
  - Single global error handler producing RFC7807 responses; include correlation ID; map validation/domain errors.

- Uniform cache strategy and CDN policy
  - Define per-route TTLs and `Cache-Control`/`ETag`/`Vary` strategy; document CDN behavior and purge flows.

- Generalized idempotency
  - Require `Idempotency-Key` for all non-idempotent writes; persist key→response with TTL; detect body hash conflicts.

- Webhooks and WebSockets
  - Outbound webhooks with HMAC signing, retries, and dead-letter; inbound verification endpoint.
  - Realtime updates over WebSocket with auth (SSE fallback remains available).

### Base components unification (UI, Fields, Pages, Reports)

Design note

- Goal: Unify cross-cutting behavior via small, composable “base” components so features inherit accessibility, layout, and behavior without duplication.

Key principles

- Prefer composition over class inheritance (React best practice).
- Centralize cross-cutting concerns (IDs, a11y, status, theming, error/loading, analytics).
- Keep bases tiny and focused; thin wrappers per control/page.

What we already have

- Field bases: `BaseLabeledField` (label/info/hint/status/right, unique ids, idPrefix) and `BaseLabeledSlider` (ticks/snap/soft preference/aria).
- Design tokens: `client/src/components/ui/styles.ts` (layout, colors, typography, slider tokens).

What to add

1) FieldBase (complete the field layer) [Status: Done]

- Add: validation surface (invalid, helpText), disabled/readOnly, required, onFocus/onBlur analytics hook, testId.
- Implement: extend `BaseLabeledField` props with optional `validationState?: 'none'|'error'|'success'`, `required?: boolean`, `disabled?: boolean`, `readOnly?: boolean`, `testId?: string`, and forward to `FieldContainer` + child.
- Benefit: every input gets uniform a11y/validation/telemetry without repeating code.

2) UIBase (app-wide) [Status: In Progress]

- UIProvider: theme + density + RTL + tokens via React context; expose CSS vars to all components.
- CardBase: unify card paddings/variants/shadows; wrap tokens in a small component.
- MessageBase: standard notice patterns (info/warning/error/success) with icon, title, body, action slot.
- ModalBase/PopoverBase: focus trap, escape-to-close, aria-* wired.
- Benefit: consistent look/feel and interaction; one place to tweak theme/density.

4) PageBase [Status: In Progress]

- Page shell (background, `PAGE_CONTAINER`, `SECTION_STACK`), head/meta (title/description), ErrorBoundary + Suspense, route analytics, keyboard “skip to content”, optional stage guard (no auto-advance).
- Implement: `client/src/components/pages/PageBase.tsx` with slots: `headerSlot`, `actionsSlot`, `children` and props: `title`, `meta`, `requireExplicitAdvance?`.
- Migrate: `pages/App.tsx`, flows (`ModeSelect`, `SimpleRequirements`, `ProRequirements`, `ExploreGrid`, `CompareShowdown`).
- Benefit: uniform navigation semantics and accessibility; one place to enforce “explicit click to advance”.

Cross-cutting utilities [Status: Open]

- Unique IDs: already solved via `BaseLabeledField`/`BaseLabeledSlider` + `idPrefix`.
- Accessibility: consistent `aria-labelledby`, required/invalid, keyboard focus rings.
- Telemetry: optional `onChangeAnalytics?: (name, value, meta) => void` injected by provider; bases call it automatically on commit.
- Feature flags: UIProvider can expose toggles (e.g., soft-preference default visibility).
- Theming: single source of CSS vars; dark/light, density.

Migration plan (incremental)

- Phase 1: Extend FieldBase with validation/disabled/readOnly/testId; no visual changes.
- Phase 2: Introduce UIProvider, CardBase, MessageBase; migrate callers opportunistically.
- Phase 3: Add PageBase; migrate flow pages.
- Phase 4: Add BaseReport; migrate `Report.tsx` and `report/*`.
- Tests: snapshot bases; integration tests for representative field/page/report covering a11y roles, IDs, focus behavior.

Benefits

- Less duplication; faster feature work.
- Consistent a11y and UX across the app.
- Easier theming and future redesigns.
- Deterministic IDs for e2e; fewer flaky tests.
- Centralized analytics/telemetry and loading/error standards.
