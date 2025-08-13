import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
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
};

export default function LabeledTextArea({ label, infoText, value, onChange, rows = 3, placeholder, right, hint, status }: Props) {
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} right={right} hint={hint} status={status}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`${INPUT_FORM} ${INPUT_STYLE}`}
      />
    </FieldContainer>
  );
}


