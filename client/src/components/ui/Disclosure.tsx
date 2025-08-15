import React from 'react';

type Props = {
  id: string;
  isOpen: boolean;
  onToggle: () => void;
  summary: React.ReactNode;
  children: React.ReactNode;
};

export default function Disclosure({ id, isOpen, onToggle, summary, children }: Props) {
  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={id}
        onClick={onToggle}
        className="text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
      >
        {summary}
      </button>
      {isOpen && (
        <div id={id} className="mt-2 text-xs text-[var(--text-muted)]">
          {children}
        </div>
      )}
    </div>
  );
}


