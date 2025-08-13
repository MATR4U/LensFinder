import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
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
  idPrefix?: string;
};

export default function LabeledNumberField({ label, infoText, value, onChange, min, max, step, placeholder, right, hint, status, idPrefix }: Props) {
  return (
    <BaseLabeledField label={label} infoText={infoText} right={right} hint={hint} status={status} idPrefix={idPrefix}>
      {({ inputId, labelId }) => (
        <input
          id={inputId}
          aria-labelledby={labelId}
          type="number"
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? NaN : Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className={`${INPUT_FORM} ${INPUT_STYLE}`}
        />
      )}
    </BaseLabeledField>
  );
}


