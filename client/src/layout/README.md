LensFinder Layout Module

Overview
- This module exposes the app’s reusable layout shell and design tokens so other apps can use the same architecture without pulling in feature code.

Exports
- Components:
  - PageShell: The top-level page wrapper (background, header/footer slots, banner, subheader, suspense/error boundaries).
  - Section: Consistent section container with title/actions bar.
  - StageHeader: Stage heading with optional result count and right-side slot.
  - StageNav: Back/Reset/Continue row (memoized).
  - Modal: Layered modal with backdrop, header, and footer slots.

- Tokens:
  - Spacing/grid/rows: PAGE_CONTAINER, SECTION_STACK, GRID_*, ROW_BETWEEN, ACTION_ROW, STACK_Y, TRAY, STICKY_TOP/BOTTOM
  - Cards/glass: CARD_BASE, CARD_NEUTRAL, GLASS_PANEL, GLASS_CARD_SM, AURA_ACCENT
  - Typography/badges: TITLE_H1, TITLE_H2, BADGE_COUNT, BADGE_ACCENT, TEXT_SM/XS, etc.
  - Inputs/sliders: INPUT_* / SELECT_* / CHECKBOX_* and SLIDER_* tokens
  - Misc: FORM_LABEL/HELP, DIVIDER_T, SPINNER_SM

Usage
import { PageShell, Section, StageHeader, StageNav, Modal, PAGE_CONTAINER, BADGE_COUNT } from '../../layout';

function MyPage() {
  return (
    <PageShell title="Example">
      <Section title="Header" actions={<span className={BADGE_COUNT}>Info</span>}>
        <StageHeader title="Step" resultsCount={3} right={<button>Action</button>} />
        {/* Content */}
        <StageNav onBack={() => {}} onReset={() => {}} onContinue={() => {}} />
      </Section>
    </PageShell>
  );
}

Notes
- This is a facade; components live under components/ui and components/pages. Re-exports keep source stable while enabling re-use in other apps.
- Keep feature-agnostic. Do not export feature components here (filters, cards, etc.).
New PageShell slots
- topbarSlot: Renders a sticky header bar above the banner
- sidebarSlot: Optional left sidebar; inline on md+ by default
- breadcrumbSlot: Compact breadcrumb row under the header
- sidebarMode: 'inline' | 'overlay' (default 'inline')
- containerAware: boolean to opt in to container-based sizing

New tokens
- HEADER_BAR_BG, SIDEBAR_BASE, SIDEBAR_OVERLAY, CONTENT_GRID, BREADCRUMB_ROW
- Z_* layer tokens: Z_BASE, Z_HEADER, Z_SIDEBAR, Z_OVERLAY, Z_MODAL, Z_TOAST
- FOCUS_RING, CONTAINER_INLINE

Examples
function WithTopbarSidebar() {
  return (
    <PageShell
      title="Dashboard"
      topbarSlot={<div>Topbar</div>}
      sidebarSlot={<nav>Menu</nav>}
      breadcrumbSlot={<nav aria-label="Breadcrumb">Home / Dashboard</nav>}
    >
      <Section title="Content">...</Section>
    </PageShell>
  );
}
