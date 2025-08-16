import React from 'react';

export function useSliderTooltip({ min, max, values: _values, isSingle: _isSingle }: { min: number; max: number; values: number[]; isSingle: boolean; }) { // TODO: use values/isSingle to drive tooltip content
  const [activeThumb, setActiveThumb] = React.useState<number | null>(null);
  const posRef = React.useRef<{ x: number; t: number } | null>(null);
  const velocityRef = React.useRef<number>(0);
  const span = Math.max(1, max - min);
  const toPct = (n: number) => ((n - min) / span) * 100;

  const onPointerDown = (thumbIndex: number) => (e: React.PointerEvent) => {
    setActiveThumb(thumbIndex);
    posRef.current = { x: e.clientX, t: performance.now() };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (posRef.current) {
      const dt = Math.max(1, performance.now() - posRef.current.t);
      const dx = e.clientX - posRef.current.x;
      velocityRef.current = dx / dt;
      posRef.current = { x: e.clientX, t: performance.now() };
    }
  };
  const onPointerUp = (thumbIndex: number) => () => {
    setActiveThumb((i) => (i === thumbIndex ? null : i));
    posRef.current = null;
  };

  return { activeThumb, setActiveThumb, onPointerDown, onPointerMove, onPointerUp, toPct };
}


