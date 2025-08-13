## Summary

Describe what/why concisely. Link to the corresponding `TODO.MD` item(s).

## Definition of Ready (DoR)

- [ ] Design note (what/why, approach)
- [ ] Affected files/modules listed
- [ ] Env vars/secrets identified and mapped to Compose/K8s
- [ ] Tests identified (server, client, e2e) and coverage targets

## Changes

- Key changes and files edited

## Definition of Done (DoD)

- [ ] Server tests green: `npm run test:server`
- [ ] Client tests green: `npm run test:client`
- [ ] E2E tests green: `npm run test:e2e`
- [ ] Build passes: `npm run build`
- [ ] 100% atomic coverage for changed areas
- [ ] Docs updated (README/contracts) and infra/env manifests updated
- [ ] No defensive programming; strict, root-cause fixes
- [ ] No hardcoded config; all config via `.env.*`

## Screenshots/Notes (optional)

