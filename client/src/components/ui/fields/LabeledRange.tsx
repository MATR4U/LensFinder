import React from 'react';
import { type FieldStatus } from './FieldContainer';
import { atBoundsStatus } from './status';
import BaseLabeledSlider from './BaseLabeledSlider';
import type { FilterMode } from '../FilterModeSwitch';

type Range = { min: number; max: number };

type Props = {
  label: string;
  infoText?: string;
  min: number;
  max: number;
  step?: number;
  value: Range;
  onChange: (r: Range) => void;
  ticks?: number[];
  snap?: boolean;
  format?: (v: number) => string;
  tickFormatter?: (v: number) => string;
  parse?: (s: string) => number;
  trackStyle?: React.CSSProperties;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  // optional override id for label; otherwise auto-generated
  id?: string;
  warningTip?: string;
  softPreference?: { checked: boolean; onChange: (v: boolean) => void; id?: string; label?: string };
  mode?: { value: FilterMode; onChange: (m: FilterMode) => void };
  idPrefix?: string;
  disabled?: boolean;
  histogramValues?: number[];
  histogramTotalValues?: number[];
  histogramShowMaxLabel?: boolean;
};

export default function LabeledRange({ label, infoText, min, max, step, value, onChange, ticks, snap, format, tickFormatter, parse, trackStyle, right, hint, status, id, warningTip, softPreference, mode, idPrefix, disabled, histogramValues, histogramTotalValues, histogramShowMaxLabel }: Props) {
  const fieldStatus = atBoundsStatus({ value, min, max, currentStatus: status });
  return (
    <BaseLabeledSlider
      label={label}
      infoText={infoText}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      ticks={ticks}
      snap={snap}
      format={format}
      tickFormatter={tickFormatter}
      parse={parse}
      trackStyle={trackStyle}
      right={right}
      hint={hint}
      status={fieldStatus}
      id={id}
      warningTip={warningTip}
      softPreference={softPreference}
      mode={mode}
      idPrefix={idPrefix}
      disabled={!!disabled}
      histogramValues={histogramValues}
      histogramTotalValues={histogramTotalValues}
      histogramShowMaxLabel={histogramShowMaxLabel}
    />
  );
}


