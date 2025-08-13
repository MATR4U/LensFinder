## Pre-commit test script and checklist

Use this quick sequence before every commit to keep the repo green and predictable. It mirrors our conventions and CI behavior.

### 0) Preconditions
- Docker daemon running if you want e2e to execute locally (otherwise they are skipped by design)
- Local Postgres will run on host port 55432 for tests

### 1) Fast local verification (no DB)

Run unit + type checks for server and client quickly:

```bash
SKIP_DB_TESTS=1 npm run ci:fast
```

What this covers:
- Server unit/integration tests that don’t require DB, plus TypeScript check
- Client unit tests with coverage

### 2) Build both apps

Ensure production builds compile cleanly:

```bash
npm run build
```

### 3) Optional deeper checks locally

If Docker is running, you can perform the full verification that CI runs:

```bash
npm run ci:verify
```

This will:
- Build server and client
- Start Postgres via Docker and run migrations
- Run server tests (including DB-backed suites)
- Run client tests
- Run Playwright e2e on Chromium/Firefox/WebKit (skips entirely if Docker is not running)

### 4) UI affordance expectations (sanity check)
These are validated by e2e and should be preserved when touching UI logic:
- Mode screen shows buttons labeled 'Beginner' and 'Pro'; navigation via 'Continue'
- Requirements heading is exactly 'Your requirements'
- Checkboxes labeled exactly 'Weather sealed' and 'Macro'
- Results grid renders cards with `data-testid="lens-card"`; each card has a visible 'Select' button and a `[data-testid="compare-toggle"]` button that toggles to 'Remove'

### One-command fast path

You can run the above steps 1–2 with:

```bash
npm run test:precommit
```

Use `npm run ci:verify` before opening a PR.


