import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import RangeSlider from '../RangeSlider';
import { SLIDER_FIELD_STACK, INLINE_LABEL_MUTED_XS } from '../styles';
import Checkbox from '../Checkbox';
import NumberInput from '../NumberInput';
import FilterModeSwitch, { type FilterMode } from '../FilterModeSwitch';
import Histogram from '../Histogram';
import { stableIdFromLabel } from './id';
import { computeNormalizedHistogram } from '../../../lib/hist';
import { useLabeledIds } from '../../../hooks/useLabeledIds';

type Range = { min: number; max: number };

type CommonProps = {
  label: string;
  infoText?: string;
  min: number;
  max: number;
  step?: number;
  ticks?: number[];
  snap?: boolean;
  format?: (v: number) => string;
  tickFormatter?: (v: number) => string;
  parse?: (s: string) => number;
  trackStyle?: React.CSSProperties;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  id?: string; // optional override id for label
  idPrefix?: string; // optional deterministic id prefix
  warningTip?: string;
  // Optional soft preference checkbox shown inline on the right
  softPreference?: { checked: boolean; onChange: (v: boolean) => void; id?: string; label?: string };
  // Optional tri-state filter mode; when provided it supersedes softPreference
  mode?: { value: FilterMode; onChange: (m: FilterMode) => void };
  // Extended a11y/validation and test hooks
  validationState?: 'none' | 'error' | 'success';
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  testId?: string;
  histogramValues?: number[];
  histogramTotalValues?: number[];
  histogramShowMaxLabel?: boolean;
  dragging?: boolean;
};

type SingleMode = {
  singleValue: number;
  onChangeSingle: (v: number) => void;
  value?: never;
  onChange?: never;
};

type RangeMode = {
  value: Range;
  onChange: (v: Range) => void;
  singleValue?: never;
  onChangeSingle?: never;
};

type Props = CommonProps & (SingleMode | RangeMode);

export default function BaseLabeledSlider(props: Props) {
  const {
    label, infoText, min, max, step,
    ticks, snap, format, tickFormatter, parse, trackStyle,
    right, hint, status, id, warningTip, softPreference, mode, idPrefix,
    validationState = 'none', required, disabled, readOnly, testId,
    histogramValues, histogramTotalValues, histogramShowMaxLabel, dragging,
  } = props;

  const derivedPrefix = idPrefix ?? stableIdFromLabel(label);
  const { labelId: effectiveId, inputId: effectiveInputId } = useLabeledIds(label, derivedPrefix);
  const isSingle = typeof (props as SingleMode).singleValue === 'number';
  const [isDragging, setIsDragging] = React.useState(false);
  const densityNorm = React.useMemo(() => (histogramTotalValues && histogramTotalValues.length ? computeNormalizedHistogram(histogramTotalValues, min, max) : undefined), [histogramTotalValues, min, max]);

  const atEdge = isSingle
    ? ((props as SingleMode).singleValue <= min || (props as SingleMode).singleValue >= max)
    : ((props as RangeMode).value.min <= min || (props as RangeMode).value.max >= max);
  const fieldStatus: FieldStatus | undefined = atEdge ? (status ?? 'warning') : status;

  const effectiveTicks = Array.isArray(ticks) && ticks.length > 0
    ? ticks
    : [min, (min + max) / 4, (min + max) / 2, (3 * (min + max)) / 4, max];

  const composedRight = (
    <div className="hidden md:flex items-center gap-2">
      {right}
      {mode && <FilterModeSwitch mode={mode.value} onChange={mode.onChange} />}
    </div>
  );

  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
      right={composedRight}
      hint={hint}
      status={fieldStatus}
      labelId={effectiveId}
      htmlFor={effectiveInputId}
      warningTip={warningTip}
      validationState={validationState}
      required={required}
      disabled={disabled}
      readOnly={readOnly}
      testId={testId}
    >
      <div className={SLIDER_FIELD_STACK}>
        {/* Hybrid histogram: background via totalValues, foreground via current values. Extensible via props later */}
        {!isSingle && (histogramValues || histogramTotalValues) && (
          <Histogram
            values={histogramValues || []}
            totalValues={histogramTotalValues}
            min={min}
            max={max}
            selection={{ min: (props as RangeMode).value.min, max: (props as RangeMode).value.max }}
            dragging={isDragging}
            onSelectRange={(r) => (props as RangeMode).onChange({ ...(props as RangeMode).value, min: Math.max(min, Math.min(max, Math.round(r.min))), max: Math.max(min, Math.min(max, Math.round(r.max))) })}
            showMaxLabel={!!histogramShowMaxLabel}
          />
        )}
        {isSingle ? (
          <RangeSlider
            min={min}
            max={max}
            step={step}
            singleValue={(props as SingleMode).singleValue}
            onChangeSingle={(props as SingleMode).onChangeSingle}
            ticks={effectiveTicks}
            snap={snap}
            format={format}
            tickFormatter={tickFormatter}
            ariaLabelledBy={effectiveId}
            densityNormalized={densityNorm}
          />
        ) : (
          <RangeSlider
            min={min}
            max={max}
            step={step}
            value={(props as RangeMode).value}
            onChange={(props as RangeMode).onChange}
            ticks={effectiveTicks}
            snap={snap}
            format={format}
            tickFormatter={tickFormatter}
            trackStyle={trackStyle}
            ariaLabelledBy={effectiveId}
            onDraggingChange={(v) => setIsDragging(v)}
            densityNormalized={densityNorm}
          />
        )}
        {/* Mode control now lives in the header (right slot). Keep right column for numeric inputs only. */}
        {/* Inline numeric inputs for precise control */}
        {!isSingle && (
          <div className="mt-2 flex items-center gap-2 md:col-span-2">
            {(() => {
              const rv = (props as RangeMode).value;
              const viewMin = Math.min(Math.max(rv.min, min), max);
              const viewMax = Math.min(Math.max(rv.max, min), max);
              return (
                <>
                  <NumberInput value={viewMin} onChange={(v) => (props as RangeMode).onChange({ ...rv, min: v })} min={min} max={max} step={step} format={format} parse={parse} />
                  <span className={INLINE_LABEL_MUTED_XS}>to</span>
                  <NumberInput value={viewMax} onChange={(v) => (props as RangeMode).onChange({ ...rv, max: v })} min={min} max={max} step={step} format={format} parse={parse} />
                </>
              );
            })()}
          </div>
        )}
      </div>
    </FieldContainer>
  );
}


