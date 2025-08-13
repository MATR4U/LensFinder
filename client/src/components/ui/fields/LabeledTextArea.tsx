import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
import { INPUT_FORM, INPUT_STYLE } from '../styles';

type Props = {
  label: string;
  infoText?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  idPrefix?: string;
};

export default function LabeledTextArea({ label, infoText, value, onChange, rows = 3, placeholder, right, hint, status, idPrefix }: Props) {
  return (
    <BaseLabeledField label={label} infoText={infoText} right={right} hint={hint} status={status} idPrefix={idPrefix}>
      {({ inputId, labelId }) => (
        <textarea
          id={inputId}
          aria-labelledby={labelId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`${INPUT_FORM} ${INPUT_STYLE}`}
        />
      )}
    </BaseLabeledField>
  );
}


