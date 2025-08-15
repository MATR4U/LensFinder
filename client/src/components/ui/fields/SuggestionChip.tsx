import React from 'react';

type Props = {
  label: string;
  count?: number;
  onApply?: () => void;
};

export default function SuggestionChip({ label, count, onApply }: Props) {
  return (
    <button
      type="button"
      onClick={onApply}
      className="px-2 py-0.5 rounded bg-[var(--badge-warning-bg)] hover:bg-[color-mix(in_oklab,var(--badge-warning-bg),white_10%)] border border-[var(--badge-warning-border)] text-[var(--badge-warning-text)] text-[11px]"
    >
      {label}{typeof count === 'number' ? ` · Matches: ${count}` : ''}
    </button>
  );
}


