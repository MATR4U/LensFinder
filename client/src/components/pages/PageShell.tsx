import React from 'react';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, ROW_BETWEEN, TITLE_H1, VIGNETTE_OVERLAY_BG, FOOTER_BAR_BG, HEADER_BAR_BG, SIDEBAR_BASE, SIDEBAR_OVERLAY, CONTENT_GRID, BREADCRUMB_ROW, FOCUS_RING, OVERLAY_BACKDROP_DARK } from '../ui/styles';
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
  sidebarOpen?: boolean;
  onRequestCloseSidebar?: () => void;
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
  sidebarOpen = true,
  onRequestCloseSidebar,
}: Props) {
  const canUndo = !!historyControls?.canUndo;
  const canRedo = !!historyControls?.canRedo;
  const onUndo = historyControls?.onUndo;
  const onRedo = historyControls?.onRedo;

  const openerRef = React.useRef<Element | null>(null);

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

  const overlayActive = !!sidebarSlot && sidebarMode === 'overlay' && sidebarOpen;

  React.useEffect(() => {
    if (!overlayActive) return;
    openerRef.current = document.activeElement as Element | null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const main = document.getElementById('content-root');
    if (main) {
      main.setAttribute('aria-hidden', 'true');
    }
    return () => {
      document.body.style.overflow = prev;
      if (main) {
        main.removeAttribute('aria-hidden');
      }
      const el = openerRef.current as HTMLElement | null;
      if (el && typeof el.focus === 'function') el.focus();
    };
  }, [overlayActive]);

  const sidebarRef = React.useRef<HTMLElement | null>(null);
  React.useEffect(() => {
    if (!overlayActive || !sidebarRef.current) return;
    const container = sidebarRef.current;
    const focusable = container.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onRequestCloseSidebar?.();
        e.stopPropagation();
      } else if (e.key === 'Tab' && focusable.length > 0) {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    };
    document.addEventListener('keydown', handleKey, true);
    first?.focus();
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [overlayActive, onRequestCloseSidebar]);

  const handleBackdropClick = React.useCallback(() => {
    onRequestCloseSidebar?.();
  }, [onRequestCloseSidebar]);

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

          <div id="content-root">
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
            ) : sidebarSlot && sidebarMode === 'overlay' && sidebarOpen ? (
              <div className="relative">
                <button aria-hidden className={`fixed inset-0 ${OVERLAY_BACKDROP_DARK}`} onClick={handleBackdropClick} />
                <aside
                  ref={sidebarRef as any}
                  className={SIDEBAR_OVERLAY}
                  aria-label="Sidebar"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="flex items-center justify-end mb-3">
                    <button
                      type="button"
                      aria-label="Close sidebar"
                      className={`px-3 py-2 rounded border border-[var(--control-border)] text-sm ${FOCUS_RING}`}
                      onClick={() => onRequestCloseSidebar?.()}
                    >
                      Close
                    </button>
                  </div>
                  {sidebarSlot}
                </aside>
                <Boundary fallback={errorFallback}>
                  <React.Suspense fallback={suspenseFallback ?? null}>
                    <div id="content" className={SECTION_STACK}>
                      {children}
                    </div>
                  </React.Suspense>
                </Boundary>
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
          </div>

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
