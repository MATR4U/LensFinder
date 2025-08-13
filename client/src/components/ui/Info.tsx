import React from 'react';

type Props = {
  text: string;
  className?: string;
};

export default function Info({ text, className = '' }: Props) {
  return (
    <span className={`relative inline-flex items-center group ${className}`}>
      <span className="h-5 w-5 rounded-full bg-[var(--control-bg)] border border-[var(--control-border)] text-[var(--text-muted)] grid place-items-center text-[11px]/[11px] cursor-help">?</span>
      <span className="pointer-events-none absolute z-20 top-full mt-2 hidden w-72 rounded-md border border-[var(--control-border)] bg-[var(--control-bg)] p-3 text-xs text-[var(--text-color)] shadow-xl group-hover:block">
        {text}
      </span>
    </span>
  );
}


