import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledSlider from './BaseLabeledSlider';

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
  trackStyle?: React.CSSProperties;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  // optional override id for label; otherwise auto-generated
  id?: string;
  warningTip?: string;
  softPreference?: { checked: boolean; onChange: (v: boolean) => void; id?: string; label?: string };
};

export default function LabeledRange({ label, infoText, min, max, step, value, onChange, ticks, snap, format, trackStyle, right, hint, status, id, warningTip, softPreference }: Props) {
  const atAnyEdge = value.min <= min || value.max >= max;
  const fieldStatus = atAnyEdge ? (status ?? 'warning') : status;
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
      trackStyle={trackStyle}
      right={right}
      hint={hint}
      status={fieldStatus}
      id={id}
      warningTip={warningTip}
      softPreference={softPreference}
    />
  );
}


