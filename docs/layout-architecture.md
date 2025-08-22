# Layout Architecture

This app’s layout and design primitives are exposed via a reusable module to be consumed by this and other apps, without pulling in feature-specific code.

- Entry point: `client/src/layout/index.ts`
- Scope: page shell, sections, stage headers/navigation, modal, and design tokens (spacing, grid, cards, typography, inputs, sliders).
- Excludes: business logic, store bindings, filters, feature pages.

## Components

- PageShell
  - Generic top-level page wrapper. Accepts title/meta, banner/header/subheader slots, error/suspense boundaries, footer slot, and optional history controls.
  - Prop `historyControls?: { canUndo?: boolean; canRedo?: boolean; onUndo?: () => void; onRedo?: () => void }`
  - Free of app state; fully prop-driven.

- Section
  - Consistent section container with optional title and actions.

- StageHeader
  - Heading with optional result count and right-side slot.

- StageNav
  - Back/Reset/Continue row (memoized; prop-driven).

- Modal
  - Layered modal with backdrop, header, scrollable body, and footer area.

## Tokens

Centralized class tokens under `components/ui/styles.ts` are re-exported from `client/src/layout`:
- App/page scaffolding: APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK
- Cards/panels: CARD_BASE, CARD_NEUTRAL, CARD_* variants, PANEL_*
- Typography/badges: TITLE_H*, TEXT_*, BADGE_*
- Grid/layout: GRID_*, ROW_*, ACTION_ROW, STACK_Y, TRAY, STICKY_*
- Inputs/sliders: INPUT_*, SELECT_*, CHECKBOX_*, FIELD_CONTAINER_*
- Slider primitives: SLIDER_* tokens
- Utilities: DIVIDER_T, SPINNER_SM, COLLAPSE_TOGGLE, ICON_CHEVRON_SM

## Usage

Import from the layout module:

```tsx
import { PageShell, Section, StageHeader, StageNav, Modal, BADGE_COUNT } from '../layout';

export default function Example() {
  return (
    <PageShell title="Example" metaDescription="Demo page" onView={() => {}}>
      <Section title="Header" actions={<span className={BADGE_COUNT}>Info</span>}>
        <StageHeader title="Step" resultsCount={3} right={<button>Action</button>} />
        <StageNav onBack={() => {}} onReset={() => {}} onContinue={() => {}} />
      </Section>
    </PageShell>
  );
}
```

## Migration guide

- For current app pages using `PageBase`, nothing changes.
- For reuse in other apps, prefer `PageShell`:
  - Provide your own `historyControls` if you need Undo/Redo in footer.
  - Provide any header/banner/subheader/footer content via the corresponding slots.
- Keep business logic out of the layout module. Compose with your app store/actions outside and inject via props.

## Accessibility and responsiveness

- PageShell includes skip link and structured headings.
- Tokens implement consistent spacing, focus rings, and responsive grid utilities.
- Modal traps visual focus via overlay and provides a close button.
