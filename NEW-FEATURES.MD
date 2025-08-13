# New Feature Ideas

Curated, high‑impact ideas to enhance the app while keeping the solution lean, robust, and maintainable.

## UX & Flow

- **Mode-first onboarding**: Persist selected mode in localStorage and skip the Mode step on revisit with a small banner to switch.
- **Step-aware deep links**: URL query/hash state for `mode`, `step`, and key filters; shareable flow state.
- **Keyboard navigation**: Arrow/enter shortcuts across steps and sliders; accessible focus order.
- **Inline explainer tooltips**: Lightweight `Info` hints for terms like coverage, breathing, distortion.
- **Undo/Reset**: Per-panel reset and global reset to defaults.

## Modes & Personalization

- **Adaptive beginner → pro handoff**: Offer to “unlock advanced controls” when beginner constraints become tight.
- **Profiles**: Save multiple named preference sets (e.g., Travel, Studio, Wildlife).
- **Quick-switch mode**: Cmd/Ctrl+M to toggle mode; visible in header badge.

## Recommendation Engine

- **Dynamic preset normalization**: Always normalize weights; display contribution breakdown in results.
- **Use-case templates**: Additional presets (Events, Street, Astro, Product, Birds-in-flight).
- **Penalty/bonus factors**: Soft penalties for availability/size; bonuses for native brand match or matched focal gaps.
- **Explainability**: Per-lens “why recommended” with top 3 contributing factors.

## Data Quality & Sources

- **Price sourcing**: Multi-vendor scraping with median pricing and freshness indicator; fallback to historical avg.
- **Currency support**: CHF/EUR/USD with daily FX rates; user preference stored.
- **Spec enrichment**: Add AF speed, OIS stops, focus breathing measurements, MTF proxies where available.
- **Data freshness health**: Admin panel section with last-updated timestamps per attribute.

## Reporting & Sharing

- **Shareable report links**: Short links with embedded state; optional PDF export.
- **Comparison snapshots**: Save and name compare sets; diff two snapshots.
- **Vendor handoff**: Outbound links with affiliate tags where applicable (non-intrusive).

## Performance & Offline

- **Client caching**: Cache cameras/lenses with ETag; optimistic UI during edits.
- **PWA**: Installable app, offline read-only explore for cached datasets.
- **Incremental compute**: Memoized scoring per lens; recompute only impacted items on slider move.

## Accessibility & i18n

- **A11y pass**: Color contrast guarantees, proper labels for sliders/toggles, screen reader descriptions.
- **Localization-ready**: String table with en/de/fr; number/currency formatting per locale.

## Integrations

- **Import camera from photo**: Read EXIF from a sample image to infer brand/mount starting point.
- **Community feedback**: Per-lens pros/cons voting with light moderation; optional.
- **Calendar planner**: Export chosen kit as packing list; trip date and shooting plan.

## Developer Experience & QA

- **Atomic tests**: 100% coverage targets for scoring, filtering, and presets.
- **Type-safe APIs**: Zod/ts-rest contract between client and server; runtime validation on boundaries.
- **Storybook**: Visual test harness for sliders, cards, and flow steps with a11y and interactions.
- **CI quality gates**: Lint, typecheck, unit tests, visual regression for charts/cards.

## Security & Privacy

- **Telemetry toggle**: Anonymous usage analytics with opt-in, documented in settings.
- **Secrets handling**: Server-side credential storage for price providers; never in client bundle.

## Monetization (Optional, Non-invasive)

- **Pro workspace**: Save unlimited profiles and reports; CSV/PDF exports; advanced data fields.
- **One-time supporter**: “Buy me a coffee” to unlock cosmetic themes only; no feature gating for core value.

## Roadmap (Phased)

- **Phase 1 (UX polish)**: Mode persistence, deep links, tooltips, explainability panel.
- **Phase 2 (Data & scoring)**: Currency, multi-vendor pricing, incremental compute, new presets.
- **Phase 3 (Sharing & PWA)**: Shareable report links, snapshot compare, installable PWA.
- **Phase 4 (Pro tier & analytics)**: Profiles, exports, optional analytics with opt-in.
