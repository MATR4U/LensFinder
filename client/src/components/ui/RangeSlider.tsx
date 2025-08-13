import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { SLIDER_ROOT_BASE, SLIDER_TRACK_BASE, SLIDER_RANGE_BASE, SLIDER_THUMB_BASE, TEXT_XS_MUTED, SLIDER_DENSITY_SM, SLIDER_DENSITY_MD, SLIDER_DENSITY_LG } from './styles';
import TicksOverlay from './range-slider/TicksOverlay';
import TickLabels from './range-slider/TickLabels';
import { useSliderLogic } from './range-slider/useSliderLogic';

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
  ticks,
  snap = false,
  showTickLabels = true,
  minDistance = 0,
  ariaLabelMin = 'Minimum',
  ariaLabelMax = 'Maximum',
  ariaLabelledBy,
  density = 'md',
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

  return (
    <div className={className}>
      <Slider.Root
        className={`${SLIDER_ROOT_BASE} ${densityClass} ${disabled ? 'opacity-50' : ''}`}
        value={values}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={onValueChange}
        onValueCommit={onValueCommit}
        aria-label={ariaLabelledBy ? undefined : 'Range'}
        aria-labelledby={ariaLabelledBy}
        aria-disabled={disabled}
      >
        <Slider.Track className={SLIDER_TRACK_BASE} style={trackStyle}>
          <Slider.Range className={SLIDER_RANGE_BASE} />
          <TicksOverlay ticks={ticks} toPct={toPct} />
        </Slider.Track>
        <Slider.Thumb
          aria-label={ariaLabelledBy ? undefined : (isSingle ? (ariaLabelMax ?? 'Value') : (ariaLabelMin || 'Minimum'))}
          aria-labelledby={ariaLabelledBy}
          aria-valuetext={format ? format(isSingle ? (values[0] ?? safeMin) : safeMin) : undefined}
          className={SLIDER_THUMB_BASE}
        />
        {!isSingle && (
          <Slider.Thumb
            aria-label={ariaLabelledBy ? undefined : (ariaLabelMax || 'Maximum')}
            aria-labelledby={ariaLabelledBy}
            aria-valuetext={format ? format(values[1] ?? safeMax) : undefined}
            className={SLIDER_THUMB_BASE}
          />
        )}
      </Slider.Root>
      {ticksPresent && showTickLabels && (
        <TickLabels ticks={ticks} toPct={toPct} format={format} tickFormatter={tickFormatter} />
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


