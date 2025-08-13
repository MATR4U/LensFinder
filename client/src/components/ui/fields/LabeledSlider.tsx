import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import RangeSlider from '../RangeSlider';
import { SLIDER_FIELD_STACK } from '../styles';

type Props = {
  label: string;
  infoText?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  ticks?: number[];
  snap?: boolean;
  format?: (v: number) => string;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
};

export default function LabeledSlider({ label, infoText, min, max, step, value, onChange, ticks, snap, format, right, hint, status }: Props) {
  const atLimit = (typeof min === 'number' && value <= min) || (typeof max === 'number' && value >= max);
  const fieldStatus: FieldStatus | undefined = atLimit ? (status ?? 'warning') : status;
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} right={right} hint={hint} status={fieldStatus}>
      <div className={SLIDER_FIELD_STACK}>
        <RangeSlider min={min} max={max} step={step} singleValue={value} onChangeSingle={onChange} ticks={ticks ?? [min, (min + max) / 4, (min + max) / 2, (3 * (min + max)) / 4, max]} snap={snap} format={format} showTickLabels={true} />
      </div>
    </FieldContainer>
  );
}


