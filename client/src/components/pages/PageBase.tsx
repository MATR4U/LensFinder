import React from 'react';
import { APP_BACKGROUND, PAGE_CONTAINER, SECTION_STACK, ROW_BETWEEN, TITLE_H1 } from '../ui/styles';

type Props = {
  title?: string;
  metaDescription?: string;
  headerSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  children: React.ReactNode;
  // Optional UX/telemetry utilities
  errorFallback?: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  onView?: (path: string) => void;
};

class Boundary extends React.Component<{ fallback?: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback?: React.ReactNode }) {
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

export default function PageBase({ title, metaDescription, headerSlot, actionsSlot, children, errorFallback, suspenseFallback, onView }: Props) {
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
      <a href="#content" className="sr-only focus:not-sr-only">Skip to content</a>
      <div className={PAGE_CONTAINER}>
        {(headerSlot || title || actionsSlot) && (
          <header className={`${ROW_BETWEEN} mb-4`}>
            <div>
              {title && <h1 className={TITLE_H1}>{title}</h1>}
              {headerSlot}
            </div>
            {actionsSlot}
          </header>
        )}
        <Boundary fallback={errorFallback}>
          <React.Suspense fallback={suspenseFallback ?? null}>
            <div id="content" className={SECTION_STACK}>
              {children}
            </div>
          </React.Suspense>
        </Boundary>
      </div>
    </main>
  );
}


