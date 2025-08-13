import React from 'react';
import { SLIDER_TICK_BASE } from '../styles';

type Props = {
  ticks?: number[];
  toPct: (v: number) => number;
  className?: string;
};

export default function TicksOverlay({ ticks, toPct, className = '' }: Props) {
  if (!Array.isArray(ticks) || ticks.length === 0) return null;
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      {ticks.map((t, i) => (
        <div key={`${t}-${i}`} className={SLIDER_TICK_BASE} style={{ left: `${toPct(t)}%` }} />
      ))}
    </div>
  );
}


