import React from 'react';
import Message from './Message';
import { COLLAPSE_TOGGLE, ICON_CHEVRON_SM } from './styles';

type Props = {
  title: string;
  children: React.ReactNode;
  variant?: 'neutral' | 'error' | 'warning' | 'success' | 'info';
  defaultOpen?: boolean;
  className?: string;
};

export default function CollapsibleMessage({ title, children, variant = 'info', defaultOpen = false, className = '' }: Props) {
  const [open, setOpen] = React.useState<boolean>(defaultOpen);
  const sectionId = React.useId();
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


