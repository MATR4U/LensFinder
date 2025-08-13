import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
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
};

export default function LabeledSearchBox({ label, infoText, value, onChange, placeholder = 'Search…', status, hint, onSubmit }: Props) {
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} status={status} hint={hint}>
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmit?.(); }}
          placeholder={placeholder}
          className={`${INPUT_FORM} ${INPUT_STYLE} pl-9`}
        />
        <span className={`absolute left-2 top-1/2 -translate-y-1/2 ${TEXT_MUTED}`}>🔎</span>
      </div>
    </FieldContainer>
  );
}


