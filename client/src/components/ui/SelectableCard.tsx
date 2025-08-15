import React from 'react';
import { ROW_BETWEEN, BADGE_SHAPE_XS } from './styles';

type Props = {
  title: string;
  subtitle?: string;
  description?: string;
  bullets?: string[];
  selected?: boolean;
  onSelect?: () => void;
  ariaLabel?: string;
};

export default function SelectableCard({ title, subtitle, description, bullets = [], selected = false, onSelect, ariaLabel }: Props) {
  return (
    <button
      onClick={onSelect}
      aria-label={ariaLabel}
      className={`group relative text-left rounded-xl border p-5 transition-all duration-200 ease-out ${selected ? 'border-[color-mix(in_oklab,var(--accent),black_30%)] ring-2 ring-[var(--accent)] bg-[color-mix(in_oklab,var(--accent),transparent_88%)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--accent),transparent_70%),0_8px_24px_-8px_rgba(0,0,0,0.5)]' : 'border-[var(--control-border)] bg-[var(--control-bg)] hover:bg-[color-mix(in_oklab,var(--control-bg),white_7%)] hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]'} hover:translate-y-[-3px] hover:scale-[1.01]`}
    >
      <div className={ROW_BETWEEN}>
        <div className="text-[var(--text-color)] font-medium">
          {title}
          {subtitle ? <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">— {subtitle}</span> : null}
        </div>
        {selected && <span className={`${BADGE_SHAPE_XS} bg-[var(--accent)]/90 text-[var(--accent-contrast)] shadow-[0_0_0_2px_color-mix(in_oklab,var(--accent),transparent_60%)]`}>Selected</span>}
      </div>
      {description && <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>}
      {bullets.length > 0 && (
        <ul className="mt-2 text-xs text-[var(--text-muted)] list-disc list-inside space-y-1">
          {bullets.map((b) => (<li key={b}>{b}</li>))}
        </ul>
      )}
      <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--accent),transparent_85%),inset_0_0_40px_color-mix(in_oklab,var(--accent),transparent_96%)]" aria-hidden />
    </button>
  );
}


