import React from 'react';
import { motion } from 'framer-motion';
import { computeHistogram, type HistogramBin } from '../../lib/hist';
import { scaleBand, scaleLinear } from '@visx/scale';

type Props = {
  values: number[]; // dynamic foreground values
  totalValues?: number[]; // static background values (pre-filtered universe)
  min: number;
  max: number;
  buckets?: number;
  className?: string;
  // Optional visual de-saturation function for bars outside selected slider range
  selection?: { min: number; max: number } | null;
  dragging?: boolean;
  onSelectRange?: (r: { min: number; max: number }) => void;
  showMaxLabel?: boolean;
};

export default function Histogram({ values, totalValues, min, max, buckets = 24, className: _className = '', selection, dragging = false, onSelectRange, showMaxLabel = false }: Props) { // TODO: allow className styling passthrough if needed
  const bg = React.useMemo<HistogramBin[]>(() => (totalValues ? computeHistogram(totalValues, min, max, buckets) : []), [totalValues, min, max, buckets]);
  const fg = React.useMemo<HistogramBin[]>(() => computeHistogram(values, min, max, buckets), [values, min, max, buckets]);
  const height = 40;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setWidth(Math.round(e.contentRect.width));
      }
    });
    ro.observe(el);
    setWidth(Math.round(el.getBoundingClientRect().width));
    return () => ro.disconnect();
  }, []);
  const x = React.useMemo(() => scaleBand({ domain: Array.from({ length: fg.length || buckets }, (_, i) => i), range: [0, Math.max(0, width)], paddingInner: 0.02, paddingOuter: 0.01 }), [width, fg.length, buckets]);
  const y = React.useMemo(() => scaleLinear({ domain: [0, 1], range: [0, Math.max(0, height)] }), [height]);
  const maxCount = React.useMemo(() => Math.max(1, ...fg.map((b) => b.count)), [fg]);
  return (
    <div ref={containerRef} className={`relative w-full h-[${height}px]`} aria-hidden>
      {/* Background (static) */}
      {bg.length > 0 && (
        <svg className="absolute inset-0 w-full h-full">
          {bg.map((b, i) => {
            const barW = x.bandwidth();
            const barH = y(b.height);
            const barX = x(i) ?? 0;
            const barY = height - barH;
            const dim = selection ? ((b.end < (selection?.min ?? -Infinity) || b.start > (selection?.max ?? Infinity)) ? 0.35 : 1) : 1;
            return <rect key={`bg-${i}`} x={barX} y={barY} width={barW} height={barH} fill="currentColor" opacity={dim} className="text-[var(--control-border)]" />;
          })}
        </svg>
      )}
      {/* Foreground (dynamic) */}
      <svg className="absolute inset-0 w-full h-full" role={onSelectRange ? 'listbox' : undefined} aria-label={onSelectRange ? 'Histogram' : undefined}>
        {fg.map((b, i) => {
          const barW = x.bandwidth();
          const targetH = y(b.height);
          const barX = x(i) ?? 0;
          const dim = selection ? ((b.end < (selection?.min ?? -Infinity) || b.start > (selection?.max ?? Infinity)) ? 0.5 : 1) : 1;
          const gap = Math.max(1, Math.floor(barW * 0.08));
          const visualW = Math.max(1, barW - gap);
          const rectX = barX + (barW - visualW) / 2;
          const handleSelect = () => {
            if (!onSelectRange) return;
            onSelectRange({ min: b.start, max: b.end });
          };
          if (dragging) {
            return (
              <rect
                key={`fg-${i}`}
                x={rectX}
                y={height - targetH}
                width={visualW}
                height={targetH}
                fill="currentColor"
                className="text-[var(--accent)]/70"
                opacity={dim}
                tabIndex={0}
                data-fg
                role={onSelectRange ? 'option' : undefined}
                onClick={handleSelect}
                onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onSelectRange) { e.preventDefault(); handleSelect(); } }}
              >
                <title>{`${Math.round(b.start)}–${Math.round(b.end)}: ${b.count}`}</title>
              </rect>
            );
          }
          return (
            <motion.rect
              key={`fg-${i}`}
              x={rectX}
              width={visualW}
              initial={{ y: height, height: 0 }}
              animate={{ y: height - targetH, height: targetH }}
              transition={{ type: 'spring', stiffness: 220, damping: 24, delay: i * 0.01 }}
              fill="currentColor"
              className="text-[var(--accent)]/70"
              opacity={dim}
              tabIndex={0}
              data-fg
              role={onSelectRange ? 'option' : undefined}
              onClick={handleSelect}
              onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onSelectRange) { e.preventDefault(); handleSelect(); } }}
            >
              <title>{`${Math.round(b.start)}–${Math.round(b.end)}: ${b.count}`}</title>
            </motion.rect>
          );
        })}
      </svg>
      {/* Thin grid baseline for legibility */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--control-border)]/60" />
      {showMaxLabel && (
        <div className="absolute right-1 top-0 text-[10px] text-[var(--text-muted)]">max {maxCount}</div>
      )}
    </div>
  );
}


