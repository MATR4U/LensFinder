import React from 'react';
import { TEXT_XS_MUTED } from '../styles';

type Props = {
  ticks?: number[];
  toPct: (v: number) => number;
  format?: (v: number) => string;
  tickFormatter?: (v: number) => string;
};

export default function TickLabels({ ticks, toPct, format, tickFormatter }: Props) {
  if (!Array.isArray(ticks) || ticks.length === 0) return null;
  const fmt = (v: number) => (tickFormatter ? tickFormatter(v) : (format ? format(v) : String(v)));
  return (
    <div className="mt-2 relative h-4">
      {ticks.map((t, i) => (
        <span key={`${t}-lbl-${i}`} className={`absolute -translate-x-1/2 ${TEXT_XS_MUTED}`} style={{ left: `${toPct(t)}%` }}>
          {fmt(t)}
        </span>
      ))}
    </div>
  );
}


