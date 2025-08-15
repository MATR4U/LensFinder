import React from 'react';
import { TEXT_XS_MUTED } from '../styles';

type Props = {
  ticks?: number[];
  toPct: (v: number) => number;
  format?: (v: number) => string;
  tickFormatter?: (v: number) => string;
  min?: number;
  max?: number;
};

export default function TickLabels({ ticks, toPct, format, tickFormatter, min, max }: Props) {
  if (!Array.isArray(ticks) || ticks.length === 0) return null;
  const fmt = (v: number) => (tickFormatter ? tickFormatter(v) : (format ? format(v) : String(v)));
  return (
    <div className="mt-2 relative h-4 px-2 overflow-visible">
      {ticks.map((t, i) => {
        const isEdge = (typeof min === 'number' && Math.abs(t - min) < 1e-6) || (typeof max === 'number' && Math.abs(t - max) < 1e-6);
        const translate = isEdge ? (t === min ? 'translate-x-0' : '-translate-x-full') : '-translate-x-1/2';
        const pad = isEdge ? (t === min ? 'pl-1' : 'pr-1') : '';
        return (
          <span key={`${t}-lbl-${i}`} className={`absolute ${translate} ${pad} whitespace-nowrap ${TEXT_XS_MUTED}`} style={{ left: `${toPct(t)}%` }}>
            {fmt(t).replace(/^(CHF|g|mm)\s*/i, '')}
          </span>
        );
      })}
    </div>
  );
}


