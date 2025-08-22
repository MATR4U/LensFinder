import React from 'react';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, ROW_BETWEEN, TITLE_H1, VIGNETTE_OVERLAY_BG, FOOTER_BAR_BG, HEADER_BAR_BG, SIDEBAR_BASE, CONTENT_GRID, BREADCRUMB_ROW, FOCUS_RING } from '../ui/styles';
import GLBackground from '../ui/GLBackground';

type HistoryControls = {
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
};

type Props = {
  title?: string;
  metaDescription?: string;
  headerSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  bannerSlot?: React.ReactNode;
  subheaderSlot?: React.ReactNode;
  children: React.ReactNode;
  footerSlot?: React.ReactNode;
  errorFallback?: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  onView?: (path: string) => void;
  historyControls?: HistoryControls;
  topbarSlot?: React.ReactNode;
  sidebarSlot?: React.ReactNode;
  breadcrumbSlot?: React.ReactNode;
  sidebarMode?: 'inline' | 'overlay';
  containerAware?: boolean;
};

type BoundaryProps = { fallback?: React.ReactNode; children?: React.ReactNode };

class Boundary extends React.Component<BoundaryProps, { hasError: boolean }> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() {}
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children as React.ReactElement;
  }
}

export default function PageShell({
  title,
  metaDescription,
  headerSlot,
  actionsSlot,
  bannerSlot,
  subheaderSlot,
  children,
  footerSlot,
  errorFallback,
  suspenseFallback,
  onView,
  historyControls,
  topbarSlot,
  sidebarSlot,
  breadcrumbSlot,
  sidebarMode = 'inline',
  containerAware = false,
}: Props) {
  const canUndo = !!historyControls?.canUndo;
  const canRedo = !!historyControls?.canRedo;
  const onUndo = historyControls?.onUndo;
  const onRedo = historyControls?.onRedo;

  React.useEffect(() => {
    if (title) document.title = `LensFinder – ${title}`;
    if (metaDescription) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute('name', 'description'); document.head.appendChild(tag); }
      tag.setAttribute('content', metaDescription);
    }
  }, [title, metaDescription]);

  React.useEffect(() => {
    if (onView) onView(window.location.pathname);
  }, [onView]);

  return (
    <main className={APP_BACKGROUND}>
      <GLBackground />
      <div aria-hidden className={VIGNETTE_OVERLAY_BG} />
      <div className="relative z-10">
        <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>

        {topbarSlot && (
          <div className={HEADER_BAR_BG}>
            <div className={`${PAGE_CONTAINER} py-3`}>
              {topbarSlot}
            </div>
          </div>
        )}

        {bannerSlot && (
          <div className="w-full border-b border-[var(--control-border)] bg-[color-mix(in_oklab,var(--card-bg),white_6%)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--card-bg),transparent_20%)]">
            <div className={`${PAGE_CONTAINER} py-3`}>
              {bannerSlot}
            </div>
          </div>
        )}

        <div className={`${PAGE_CONTAINER} ${containerAware ? ' ' + 'container' : ''}`}>
          {(headerSlot || title || actionsSlot) && (
            <header className={`${ROW_BETWEEN} mb-3`}>
              <div>
                {title && <h1 className={TITLE_H1}>{title}</h1>}
                {headerSlot}
              </div>
              {actionsSlot}
            </header>
          )}

          {breadcrumbSlot && (
            <div className={`${BREADCRUMB_ROW} mb-4`}>
              {breadcrumbSlot}
            </div>
          )}

          {subheaderSlot && (
            <div className="mb-6">
              {subheaderSlot}
            </div>
          )}

          {sidebarSlot && sidebarMode === 'inline' ? (
            <div className={`${CONTENT_GRID}`}>
              <aside className={SIDEBAR_BASE} aria-label="Sidebar">
                {sidebarSlot}
              </aside>
              <div>
                <Boundary fallback={errorFallback}>
                  <React.Suspense fallback={suspenseFallback ?? null}>
                    <div id="content" className={SECTION_STACK}>
                      {children}
                    </div>
                  </React.Suspense>
                </Boundary>
              </div>
            </div>
          ) : (
            <Boundary fallback={errorFallback}>
              <React.Suspense fallback={suspenseFallback ?? null}>
                <div id="content" className={SECTION_STACK}>
                  {children}
                </div>
              </React.Suspense>
            </Boundary>
          )}

          {(footerSlot || historyControls) && (
            <footer className={`${FOOTER_BAR_BG} mt-8`}>
              <div className={`${PAGE_CONTAINER} py-3`}>
                <div className="flex items-center justify-between gap-3">
                  {historyControls ? (
                    <div className="flex items-center gap-2">
                      <button className={`px-3 py-2 rounded border border-[var(--control-border)] text-sm ${FOCUS_RING} ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => canUndo && onUndo && onUndo()} aria-disabled={!canUndo}>Undo</button>
                      <button className={`px-3 py-2 rounded border border-[var(--control-border)] text-sm ${FOCUS_RING} ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => canRedo && onRedo && onRedo()} aria-disabled={!canRedo}>Redo</button>
                    </div>
                  ) : <span />}
                  <div>
                    {footerSlot}
                  </div>
                </div>
              </div>
            </footer>
          )}
        </div>
      </div>
    </main>
  );
}
