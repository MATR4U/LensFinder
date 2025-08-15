import React from 'react';
import Message from './Message';
import { COLLAPSE_TOGGLE, ICON_CHEVRON_SM } from './styles';

type Props = {
  title: string;
  children: React.ReactNode;
  variant?: 'neutral' | 'error' | 'warning' | 'success' | 'info';
  defaultOpen?: boolean;
  className?: string;
  // When provided, the section will auto-collapse after this many milliseconds
  // of inactivity. The timer resets whenever the section is opened or any of
  // the provided watchKeys change (e.g., selected mode), allowing reuse in
  // other contexts where details should close after a stable period.
  autoCollapseMs?: number;
  watchKeys?: ReadonlyArray<unknown>;
};

export default function CollapsibleMessage({ title, children, variant = 'info', defaultOpen = false, className = '', autoCollapseMs, watchKeys = [] }: Props) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const sectionId = React.useId();

  // Auto-collapse after inactivity window
  React.useEffect(() => {
    if (!autoCollapseMs || !open) return;
    const handle = window.setTimeout(() => setOpen(false), autoCollapseMs);
    return () => window.clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoCollapseMs, ...watchKeys]);

  const toggle = (
    <button
      type="button"
      onClick={() => setOpen(v => !v)}
      className={COLLAPSE_TOGGLE}
      aria-expanded={open ? 'true' : 'false'}
      aria-controls={sectionId}
    >
      <svg className={`${ICON_CHEVRON_SM} ${open ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707A1 1 0 018.707 5.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
      <span>{open ? 'Hide details' : 'Show details'}</span>
    </button>
  );
  return (
    <Message variant={variant} title={title} right={toggle} className={className}>
      {open && (
        <div id={sectionId}>
          {children}
        </div>
      )}
    </Message>
  );
}


