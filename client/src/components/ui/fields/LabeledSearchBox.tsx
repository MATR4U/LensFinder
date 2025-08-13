import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
import { INPUT_FORM, INPUT_STYLE, TEXT_MUTED } from '../styles';

type Props = {
  label: string;
  infoText?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  status?: FieldStatus;
  hint?: string;
  onSubmit?: () => void;
  idPrefix?: string;
};

export default function LabeledSearchBox({ label, infoText, value, onChange, placeholder = 'Search…', status, hint, onSubmit, idPrefix }: Props) {
  return (
    <BaseLabeledField label={label} infoText={infoText} status={status} hint={hint} idPrefix={idPrefix}>
      {({ inputId, labelId }) => (
        <div className="relative">
          <input
            id={inputId}
            aria-labelledby={labelId}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
            placeholder={placeholder}
            className={`${INPUT_FORM} ${INPUT_STYLE} pl-9`}
          />
          <span className={`absolute left-2 top-1/2 -translate-y-1/2 ${TEXT_MUTED}`}>🔎</span>
        </div>
      )}
    </BaseLabeledField>
  );
}


