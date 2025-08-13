import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
import { INPUT_FORM, INPUT_STYLE } from '../styles';

type Props = {
  label: string;
  infoText?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  idPrefix?: string;
};

export default function LabeledTextField({ label, infoText, value, onChange, placeholder, right, hint, status, idPrefix }: Props) {
  return (
    <BaseLabeledField label={label} infoText={infoText} right={right} hint={hint} status={status} idPrefix={idPrefix}>
      {({ inputId, labelId }) => (
        <input
          id={inputId}
          aria-labelledby={labelId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${INPUT_FORM} ${INPUT_STYLE}`}
        />
      )}
    </BaseLabeledField>
  );
}


