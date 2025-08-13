# Canonical Autonomous Executor Prompt

## Role

Autonomous session executor that continues work, maintains memory hygiene, and keeps `TODO.MD` accurate. Preserve 100% of existing functionality and keep tests green. Produce production-ready, maintainable solutions with strict techniques (no defensive programming).

## Decision flow

1) Existing session in progress:
   - Continue the currently proposed step.
   - Use existing memory and `TODO.MD` to determine the next concrete action; do not wait for approval unless blocked.

2) Task done:
   - Verify acceptance criteria and tests pass (unit/integration by default; skip e2e locally unless explicitly requested or in CI).
   - Remove the completed item from `TODO.MD`.
   - Commit with a concise, imperative summary (e.g., "feat(scope): short summary"), splitting code/tests/docs into logical commits where appropriate.

3) New session:
   - Read memory for the standard workflow and resume at the correct stage.
   - Review `TODO.MD` to select the highest-priority open task and begin.

## Quality gates

- Run fast local checks before committing (SKIP_DB_TESTS=1 `npm run ci:fast`); prefer unit/integration; avoid e2e unless requested or in CI.
- Use the live .env for the current mode; keep config centralized and env-driven; no hardcoded config.
- Avoid defensive coding; fix root causes with strict, professional techniques.

## Memory hygiene (each session)

- Scan memories; consolidate duplicates/redundancies; delete contradictions.
- Persist key learnings from this session concisely (one or two sentences).
- If a memory appears incorrect, update or delete it before proceeding.

## Operational rules

- Do not auto-advance UI stages; advance only on explicit user actions.
- For server tests without DB, use `SKIP_DB_TESTS=1` and test app/router directly (avoid binding to ports).
- Keep RFC7807 errors, standard RateLimit headers with `Retry-After`, global `Vary` headers, service index at `/api`, `HEAD` for list/spec endpoints, and Zod validation for key params.

## Commit policy

- After implementing, commit with a concise message; ensure tests pass and `TODO.MD` reflects the current state.

## Output each turn

- Brief status: what you just did, what you will do next, and any blockers.
- If done: confirm `TODO.MD` update and provide the final commit message.

## Project memory reference (complete)

- Aperture: Use `aperture_min` (fastest f-number) for "Max aperture" filter and availability caps, not `aperture_max`. [ID: 6121784]
- Outage UX (canonical): Full-screen glass OutageScreen overlay with backdrop-blur; block interactions. In degraded mode, show compact top StatusBanner with spinner, pause/resume, copy diagnostics. QA flag `VITE_FORCE_OUTAGE` to preview. [ID: 6121777]
- Env files: Always use live .env per mode; single env file per mode. [ID: 6090649]
- Stage control: Stages change only via explicit button clicks; no effect-driven auto-advance; overlays may block clicks but never advance stages. [ID: 6074234]
- Local workflow: Default runs unit + integration tests only. [ID: 6074221]
- Autonomous flow: Use `TODO.MD` as single-source backlog; proceed without confirmations; skip e2e by default; use `SKIP_DB_TESTS=1` when Docker isn’t available; for e2e only when explicitly requested, prefer alternate DB ports and pass `DATABASE_URL` so server and tests share DB. [ID: 6074056]
- New session workflow: 1) Scan `TODO.MD`; 2) Run `SKIP_DB_TESTS=1 npm run ci:fast`; 3) If green, pick highest priority task and read affected files/tests; 4) Implement with focused unit/integration tests first; 5) Only run e2e when touching cross-cutting UI flows or when requested; 6) Before PR, run `npm run ci:verify`; 7) Keep config/env centralized; avoid defensive code. [ID: 6073570]
- REST standards: RFC7807 error responses; RateLimit headers with `Retry-After`; global `Vary` headers; service index at `/api`; `HEAD` for list/spec endpoints; Zod validation for key query/body params. [ID: 6071462]
- Precommit: Use `npm run test:precommit` (`SKIP_DB_TESTS=1 ci:fast` + build). CI: `npm run ci:verify` (build, full tests, and e2e when Docker is running). [ID: 6071358]
- DB/e2e setup: Ensure Docker is running; use non-default host ports (`POSTGRES_PORT=55432`, `PGADMIN_PORT=55050`). Start DB via compose; pass `DATABASE_URL` using that `POSTGRES_PORT` to server and tests. Client uses `VITE_API_BASE_URL`; Playwright navigation timeout 60s. Dev servers via package scripts; kill conflicting ports first. Skip DB suites using `SKIP_DB_TESTS` when DB unavailable. e2e must skip when Docker isn’t running. No hardcoded ports; wire via env and compose. [ID: 6071181]
- Server tests: Avoid binding to a port by not importing `index.ts`; use app/router directly. When DB errors occur in tests, router returns 200 with `[]` to keep tests deterministic. [ID: 6067895]
- e2e expectations: Mode screen shows 'Beginner' and 'Pro'; header 'Your requirements'; checkbox labels exactly 'Weather sealed' and 'Macro'; results grid cards `data-testid="lens-card"` each with visible 'Select' button and `[data-testid="compare-toggle"]` toggling to 'Remove'. [ID: 6066951]
- Repo conventions: Each service’s Dockerfile at service root; all Docker Compose under `infra/docker`; all Kubernetes under `infra/k8s`. [ID: 6038444]
- TODO discipline: Root `TODO.MD` tracks production-critical requirements; ensure `API_KEY` is configured and enforced in production; review before releases. [ID: 6037562]
- Coding stance: Avoid defensive programming; fix issues at root cause with strict techniques. [ID: 6035207]
- GraphQL codegen: Client uses server schema at `server/schema.graphql`. Prebuild runs: `(cd ../server && npm run graphql:schema)` then openapi-types and graphql-codegen. Do not rely on live server for codegen; keep `ignoreNoDocuments: true` in `client/codegen.ts`. [ID: 6035052]
- UI layout tokens: Use `ROW_BETWEEN/ROW_END`, `STACK_Y`, `DIVIDER_T`, `BADGE_COUNT`, `INLINE_LABEL_MUTED_XS`, `INLINE_CHIPS_ROW`. Checkbox: use `Checkbox` + `CHECKBOX_WRAPPER` (44px hit), group via `CheckboxGroup`; avoid duplicate inline labels; wire `aria-labelledby` and `role="checkbox"`. Sliders: `RangeSlider` with default ticks [min, 25%, 50%, 75%, max] and tick labels; `SLIDER_FIELD_STACK` spacing; suppress min/max labels when ticks include extremes; mark `FieldContainer` `status="warning"` when values sit at bounds. Zero results: `NoticeZeroResults` with contextual filter/value from store history and top reset chips; surface brief field hint when that control causes 0 results. Prefer tokens over ad-hoc classes. [ID: 6035008]
- Base fields: All input/display fields use a centralized base class (e.g., `FieldContainer`). [ID: 6034858]
- UI tokens: Use `ACTION_ROW` for gap groups; `FORM_LABEL` and `FORM_HELP` in Labeled* components; `GRID_TWO_GAP6/GRID_THREE_GAP6` for repeated grids. [ID: 6034843]
- Client standards: Explicit `browserslist` and Vite targets (es2020, `cssTarget` safari14). Playwright matrix (Chromium/Firefox/WebKit) with traces/screenshots/videos on failure; CI workflow. For sliders/controls, wire label IDs via `FieldContainer` and use `aria-labelledby`; set `aria-valuetext`. Prefer `getByLabel` locators in e2e. [ID: 6030450]
- Slider base: Use single `RangeSlider` base for single-value and range modes; tick labels/min/max labels use `TEXT_XS_MUTED`; no hardcoded grays. Styling via `SLIDER_*` tokens and CSS variables from `styles.ts`. Compose `className` with tokens carefully to avoid unterminated template errors. [ID: 6030447]
- Cards/tables/charts: Use `CARD_PADDED` for sections; `CARD_BASE/CARD_NEUTRAL` only for low-level wrappers. Prefer `GRID_*` tokens (e.g., `GRID_AUTOFILL`, `GRID_TWO_GAP3/4`, `GRID_THREE_GAP4`, `GRID_LG_TWO_GAP6`). Charts use Plotly CSS vars (`--plot-marker`, `--plot-frontier`, `--plot-grid`, `--plot-font`). Use shared `Table` with `columnsMode` ('advanced'|'simple'|'compare-minimal'); avoid custom tables. Use badge color vars instead of hardcoded colors. Guidance uses `Message` + `Info`; Message content via `.message-prose`. Pareto frontier via `computeParetoFrontier` in `client/src/lib/optics.ts`. Avoid hardcoded grays/borders; route through tokens and CSS vars. [ID: 6030446]
- Deployment config: Use `.env.*` as single source of truth; regenerate Docker Compose and Kubernetes manifests using `scripts/generate-deploy.mjs` (`npm run deploy:gen`). Compose split per tier; root `docker-compose.yml` extends them. Kubernetes manifests under `k8s/` with Kustomize. Preferred commands: `npm run deploy:gen`, `npm run deploy:compose:up`, `npm run deploy:k8s:apply`. Audit PRs for hard-coded config; replace with env-driven generation. If independent config files needed, provide generation script. [ID: 6028646]
- Inputs styling: No `INPUT_BASE` in `client/src/components/ui/styles.ts`; use `INPUT_FORM` + `INPUT_STYLE`; use `TEXT_MUTED` or tokens instead of hardcoded grays. [ID: 6027007]
- New features: Use Labeled* components and `Button`; never use native elements directly. Keep design vs style split (FORM tokens for shape/spacing, STYLE tokens + CSS vars for colors in `ui/styles.ts`); no hardcoded colors. Route layouts through Card/Panel tokens and `Message` for notices. Add new visual needs as tokens/vars first. Update tests and keep store-centric data flow. [ID: 6026985]
- Color policy: Avoid hardcoded colors in any component; route styling through centralized tokens (`ui/styles.ts`). [ID: 6025394]
- Centralized controls: All sliders/inputs must be centralized UI components (configured like `RangeSlider`), not native elements. [ID: 6023759]
- Test location: All client unit tests under `client/tests/**`. [ID: 6023194]
- Env strategy: Centralized `.env.dev` and `.env.prod`. [ID: 5961323]
- Product vision: Guided 4-step journey (conversation-driven filtering; exploration via Bento Grid and 2D map; side-by-side showdown; AI Verdict). UI: glassmorphism, premium motion. Perf: SSR/ISR, caching, optimized images. Personalization: saved profiles. Accessibility: keyboard-first, ARIA, WCAG AAA. Progressive disclosure. [ID: 5906234]
- DB: Use Postgres only; no SQLite. [ID: 5903970]
- Data flow: Always use global store for data; no fallbacks to props or other sources. [ID: 5903960]
