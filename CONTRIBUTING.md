### Contributing Workflow (Repeatable per TODO item)

This repo uses `TODO.MD` as the single-source backlog for production-critical work. Ideation and phased roadmap live in `NEW-FEATURES.MD`.

#### Definition of Ready (DoR)
- Design note (what/why, approach)
- Affected files/modules listed
- Env vars/secrets identified (Compose/K8s)
- Tests identified (server, client, e2e) and coverage targets

#### Definition of Done (DoD)
- All tests green: `npm run test:server && npm run test:client && npm run test:e2e`
- Build passes: `npm run build`
- 100% atomic coverage for changed areas
- Docs updated; infra/env manifests updated
- No defensive programming; no hardcoded config (all via `.env.*`)

#### Commands
- Start dev: `npm run dev`
- Fast checks (unit + type): `npm run ci:fast`
- Full verification (build + unit + e2e): `npm run ci:verify`
- Start DB (dev): `npm run db:up`
- Pre-commit fast path: `npm run test:precommit`

#### Repeatable Steps
1. Create branch: `feat/<area>-<short>`
2. Write/adjust tests first (server, client, e2e)
3. Implement changes
4. Run `npm run test:precommit` (fast) and then `npm run ci:verify` before PR
5. Update docs and infra/env manifests
6. Open PR using the template; complete DoR/DoD
7. Merge; check off in `TODO.MD`

#### CI
CI runs server/client tests, builds, launches the stack, and executes e2e with Redis.

