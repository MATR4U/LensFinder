import React from 'react';

export type FilterMode = 'off' | 'preferred' | 'required';

type Props = {
  mode: FilterMode;
  onChange: (m: FilterMode) => void;
  className?: string;
};

export default function FilterModeSwitch({ mode, onChange, className = '' }: Props) {
  const btn = (key: FilterMode, label: string) => (
    <button
      type="button"
      aria-pressed={mode === key}
      onClick={() => onChange(key)}
      className={`px-2 py-1 text-xs rounded-md border transition-colors ${mode === key
          ? 'bg-[var(--accent)] text-[var(--accent-contrast)] border-[var(--accent)]'
          : 'bg-[var(--control-bg)] text-[var(--text-muted)] border-[var(--control-border)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_6%)]'
        }`}
    >
      {label}
    </button>
  );
  return (
    <div className={`inline-flex gap-1 ${className}`} role="group" aria-label="Filter mode">
      {btn('off', 'Off')}
      {btn('preferred', 'Soft')}
      {btn('required', 'Req')}
    </div>
  );
}


