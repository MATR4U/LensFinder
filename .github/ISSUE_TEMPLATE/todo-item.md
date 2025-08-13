---
name: TODO Item (Production-Critical)
about: Track a single production-critical task from TODO.MD with DoR/DoD
title: "[P?] <short-title>"
labels: enhancement
assignees: ''
---

## Link to TODO.MD item

- Reference: <copy the bullet or section link>

## Definition of Ready (DoR)

- [ ] Design note (what/why, approach)
- [ ] Affected files/modules listed
- [ ] Env vars/secrets identified (Compose/K8s) and values planned
- [ ] Tests identified (server, client, e2e) and coverage targets

## Execution Checklist (repeatable)

- [ ] Create branch `feat/<area>-<short>`
- [ ] Write/adjust tests first (server, client, e2e)
- [ ] Implement changes (no defensive programming)
- [ ] Run fast checks locally: `npm run ci:fast`
- [ ] Full verification: `npm run ci:verify`
- [ ] Update docs (README/contracts) and infra/env manifests
- [ ] Open PR and complete DoD checklist
- [ ] Merge and check off in `TODO.MD`

## Definition of Done (DoD)

- [ ] Server tests green: `npm run test:server`
- [ ] Client tests green: `npm run test:client`
- [ ] E2E tests green: `npm run test:e2e`
- [ ] Build passes: `npm run build`
- [ ] 100% atomic coverage for changed areas
- [ ] Docs updated and infra/env manifests updated
- [ ] No defensive programming; strict, root-cause fixes
- [ ] No hardcoded config; all config via `.env.*`

## Notes/Artifacts

- Screenshots, logs, links

