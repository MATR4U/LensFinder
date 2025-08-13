import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import RangeSlider from '../RangeSlider';
import { SLIDER_FIELD_STACK } from '../styles';

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
};

export default function LabeledRange({ label, infoText, min, max, step, value, onChange, ticks, snap, format, trackStyle, right, hint, status, id }: Props) {
  const labelId = React.useId();
  const effectiveId = id ?? labelId;
  const atAnyEdge = value.min <= min || value.max >= max;
  const fieldStatus = atAnyEdge ? (status ?? 'warning') : status;
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} right={right} hint={hint} status={fieldStatus} labelId={effectiveId}>
      <div className={SLIDER_FIELD_STACK}>
        <RangeSlider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          ticks={ticks ?? [min, (min + max) / 4, (min + max) / 2, (3 * (min + max)) / 4, max]}
          snap={snap}
          format={format}
          trackStyle={trackStyle}
          ariaLabelledBy={effectiveId}
        />
      </div>
    </FieldContainer>
  );
}


