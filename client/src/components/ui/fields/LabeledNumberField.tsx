import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import { INPUT_FORM, INPUT_STYLE } from '../styles';

type Props = {
  label: string;
  infoText?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
};

export default function LabeledNumberField({ label, infoText, value, onChange, min, max, step, placeholder, right, hint, status }: Props) {
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} right={right} hint={hint} status={status}>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        className={`${INPUT_FORM} ${INPUT_STYLE}`}
      />
    </FieldContainer>
  );
}


