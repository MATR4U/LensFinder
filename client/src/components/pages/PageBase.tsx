import React from 'react';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, ROW_BETWEEN, TITLE_H1 } from '../ui/styles';
import GLBackground from '../ui/GLBackground';
import { PAGE_BASE_BINDINGS, useFilterBindings } from '../../hooks/useStoreBindings';

type Props = {
  title?: string;
  metaDescription?: string;
  headerSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  bannerSlot?: React.ReactNode;
  subheaderSlot?: React.ReactNode; // full-width block rendered below the header
  children: React.ReactNode;
  footerSlot?: React.ReactNode;
  // Optional UX/telemetry utilities
  errorFallback?: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  onView?: (path: string) => void;
  // Show global history controls (Undo/Redo) in the footer. Defaults to false for staged screens.
  showHistoryControls?: boolean;
};

type BoundaryProps = { fallback?: React.ReactNode; children?: React.ReactNode };

class Boundary extends React.Component<BoundaryProps, { hasError: boolean }> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch() { /* no-op; could hook telemetry here */ }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children as React.ReactElement;
  }
}

export default function PageBase({ title, metaDescription, headerSlot, actionsSlot, bannerSlot, subheaderSlot, children, footerSlot, errorFallback, suspenseFallback, onView, showHistoryControls = false }: Props) {
  const { historyLength, redoLength, undo, redo } = useFilterBindings(PAGE_BASE_BINDINGS);
  const canUndo = historyLength > 0;
  const canRedo = redoLength > 0;
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
      {/* Global readability overlay sits above canvas (z-1) and below content (z-10) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-1 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.22)_0%,rgba(0,0,0,0.33)_40%,rgba(0,0,0,0.46)_100%)]" />
      <div className="relative z-10">
        <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>
        {bannerSlot && (
          <div className="w-full border-b border-[var(--control-border)] bg-[color-mix(in_oklab,var(--card-bg),white_6%)]/80 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--card-bg),transparent_20%)]">
            <div className={`${PAGE_CONTAINER} py-3`}>
              {bannerSlot}
            </div>
          </div>
        )}
        <div className={PAGE_CONTAINER}>
          {(headerSlot || title || actionsSlot) && (
            <header className={`${ROW_BETWEEN} mb-6`}>
              <div>
                {title && <h1 className={TITLE_H1}>{title}</h1>}
                {headerSlot}
              </div>
              {actionsSlot}
            </header>
          )}
          {subheaderSlot && (
            <div className="mb-6">
              {subheaderSlot}
            </div>
          )}
          <Boundary fallback={errorFallback}>
            <React.Suspense fallback={suspenseFallback ?? null}>
              <div id="content" className={SECTION_STACK}>
                {children}
              </div>
            </React.Suspense>
          </Boundary>
          {footerSlot && (
            <footer className="sticky bottom-0 left-0 right-0 border-t border-[var(--control-border)] bg-[var(--app-bg)]/90 backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--app-bg),transparent_20%)] mt-8">
              <div className={`${PAGE_CONTAINER} py-3`}>
                <div className="flex items-center justify-between gap-3">
                  {showHistoryControls ? (
                    <div className="flex items-center gap-2">
                      <button className={`px-3 py-2 rounded border border-[var(--control-border)] text-sm ${!canUndo ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => canUndo && undo()} aria-disabled={!canUndo}>Undo</button>
                      <button className={`px-3 py-2 rounded border border-[var(--control-border)] text-sm ${!canRedo ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => canRedo && redo()} aria-disabled={!canRedo}>Redo</button>
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


