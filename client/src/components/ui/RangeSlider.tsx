import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { SLIDER_ROOT_BASE, SLIDER_TRACK_BASE, SLIDER_RANGE_BASE, SLIDER_THUMB_BASE, TEXT_XS_MUTED, SLIDER_DENSITY_SM, SLIDER_DENSITY_MD, SLIDER_DENSITY_LG } from './styles';
import TicksOverlay from './range-slider/TicksOverlay';
import TickLabels from './range-slider/TickLabels';
import { useSliderLogic } from './range-slider/useSliderLogic';
import { gradientStyleFromNormalized } from '../../lib/hist';

type Range = { min: number; max: number };

type Props = {
  min: number;
  max: number;
  step?: number;
  // Range mode (default):
  value?: Range;
  onChange?: (v: Range) => void;
  // Single-thumb mode:
  singleValue?: number;
  onChangeSingle?: (v: number) => void;
  // Fired on commit (pointer up / keyboard commit). Optional and supports both modes.
  onCommit?: (v: Range | number) => void;
  className?: string;
  format?: (v: number) => string;
  tickFormatter?: (v: number) => string;
  disabled?: boolean;
  trackStyle?: React.CSSProperties;
  densityNormalized?: number[];
  ticks?: number[];
  snap?: boolean;
  showTickLabels?: boolean;
  // Enforce a minimal distance between thumbs (range mode only)
  minDistance?: number;
  // Accessibility labels
  ariaLabelMin?: string;
  ariaLabelMax?: string;
  ariaLabelledBy?: string;
  density?: 'sm' | 'md' | 'lg';
  onDraggingChange?: (dragging: boolean) => void;
};

export default function RangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  singleValue,
  onChangeSingle,
  onCommit,
  className = '',
  format,
  tickFormatter,
  disabled = false,
  trackStyle,
  densityNormalized,
  ticks,
  snap = true,
  showTickLabels = true,
  minDistance = 0,
  ariaLabelMin = 'Minimum',
  ariaLabelMax = 'Maximum',
  ariaLabelledBy,
  density = 'md',
  onDraggingChange,
}: Props) {
  const { isSingle, safeMin, safeMax, values, onValueChange, onValueCommit } = useSliderLogic({
    min,
    max,
    ticks,
    snap,
    minDistance,
    rangeValue: value,
    singleValue,
    onChangeRange: onChange,
    onChangeSingle,
    onCommit,
  });
  const span = Math.max(1, max - min);
  const toPct = (n: number) => ((n - min) / span) * 100;
  const densityClass = density === 'sm' ? SLIDER_DENSITY_SM : density === 'lg' ? SLIDER_DENSITY_LG : SLIDER_DENSITY_MD;
  const ticksPresent = Array.isArray(ticks) && ticks.length > 0;
  const includesExtremes = ticksPresent && (
    (ticks as number[]).some((t) => Math.abs(t - min) < 1e-6) &&
    (ticks as number[]).some((t) => Math.abs(t - max) < 1e-6)
  );
  const [activeThumb, setActiveThumb] = React.useState<number | null>(null);
  const posRef = React.useRef<{ x: number; t: number } | null>(null);
  const velocityRef = React.useRef<number>(0);
  const formatValue = (n: number) => (format ? format(n) : String(n));

  return (
    <div className={`pb-5 ${className}`}>
      <Slider.Root
        className={`${SLIDER_ROOT_BASE} ${densityClass} ${disabled ? 'opacity-50' : ''}`}
        value={values}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(arr) => { onDraggingChange?.(true); onValueChange(arr); }}
        onValueCommit={onValueCommit}
        aria-label={ariaLabelledBy ? undefined : 'Range'}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (disabled) return;
          const stepBase = step || 1;
          const big = stepBase * 10;
          const k = e.key;
          if (e.shiftKey && (k === 'ArrowLeft' || k === 'ArrowRight')) {
            e.preventDefault();
            const sign = k === 'ArrowLeft' ? -1 : 1;
            const delta = big * sign;
            const next = isSingle
              ? [Math.min(max, Math.max(min, (values[0] ?? safeMin) + delta))]
              : [Math.min(max, Math.max(min, (values[0] ?? safeMin))), Math.min(max, Math.max(min, (values[1] ?? safeMax) + delta))];
            onValueChange(next as number[]);
          }
          if (k === 'Home' || k === 'End') {
            e.preventDefault();
            const next = isSingle
              ? [k === 'Home' ? min : max]
              : [k === 'Home' ? min : (values[0] ?? safeMin), k === 'Home' ? (values[1] ?? safeMax) : max];
            onValueChange(next as number[]);
            onValueCommit(next as number[]);
          }
        }}
      >
        <Slider.Track className={SLIDER_TRACK_BASE} style={{ ...(densityNormalized && densityNormalized.length ? gradientStyleFromNormalized(densityNormalized) : {}), ...(trackStyle || {}) }}>
          <Slider.Range className={SLIDER_RANGE_BASE} />
          <TicksOverlay ticks={ticks} toPct={toPct} />
        </Slider.Track>
        <Slider.Thumb
          aria-label={ariaLabelledBy ? undefined : (isSingle ? (ariaLabelMax ?? 'Value') : (ariaLabelMin || 'Minimum'))}
          aria-labelledby={ariaLabelledBy}
          aria-valuetext={formatValue(isSingle ? (values[0] ?? safeMin) : safeMin)}
          className={SLIDER_THUMB_BASE}
          onPointerDown={(e) => { setActiveThumb(0); posRef.current = { x: e.clientX, t: performance.now() }; onDraggingChange?.(true); }}
          onPointerMove={(e) => {
            if (posRef.current) {
              const dt = Math.max(1, performance.now() - posRef.current.t);
              const dx = e.clientX - posRef.current.x;
              velocityRef.current = dx / dt; // px/ms
              posRef.current = { x: e.clientX, t: performance.now() };
            }
          }}
          onPointerUp={() => { setActiveThumb((i) => (i === 0 ? null : i)); posRef.current = null; onDraggingChange?.(false); }}
        />
        {!isSingle && (
          <Slider.Thumb
            aria-label={ariaLabelledBy ? undefined : (ariaLabelMax || 'Maximum')}
            aria-labelledby={ariaLabelledBy}
            aria-valuetext={formatValue(values[1] ?? safeMax)}
            className={SLIDER_THUMB_BASE}
            onPointerDown={(e) => { setActiveThumb(1); posRef.current = { x: e.clientX, t: performance.now() }; onDraggingChange?.(true); }}
            onPointerMove={(e) => {
              if (posRef.current) {
                const dt = Math.max(1, performance.now() - posRef.current.t);
                const dx = e.clientX - posRef.current.x;
                velocityRef.current = dx / dt;
                posRef.current = { x: e.clientX, t: performance.now() };
              }
            }}
            onPointerUp={() => { setActiveThumb((i) => (i === 1 ? null : i)); posRef.current = null; onDraggingChange?.(false); }}
          />
        )}
        {/* Live value tooltips */}
        {activeThumb !== null && !disabled && (
          <div className="pointer-events-none absolute -translate-x-1/2 bottom-full mb-1 rounded-md border border-[var(--control-border)] bg-[var(--control-bg)] px-2 py-0.5 text-xs text-[var(--text-color)] shadow transition-transform duration-150 ease-out">
            <span style={{ position: 'relative', left: `${toPct(values[activeThumb] ?? (activeThumb === 0 ? safeMin : safeMax))}%` }}>
              {formatValue(values[activeThumb] ?? (activeThumb === 0 ? safeMin : safeMax))}
            </span>
          </div>
        )}
      </Slider.Root>
      {ticksPresent && showTickLabels && (
        <TickLabels ticks={ticks} toPct={toPct} format={format} tickFormatter={tickFormatter} min={min} max={max} />
      )}
      {!isSingle && !(showTickLabels && ticksPresent && includesExtremes) && (
        <div className={`mt-2 flex justify-between ${TEXT_XS_MUTED}`}>
          <span>{format ? format(safeMin) : safeMin}</span>
          <span>{format ? format(safeMax) : safeMax}</span>
        </div>
      )}
    </div>
  );
}


