import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
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
};

export default function LabeledTextField({ label, infoText, value, onChange, placeholder, right, hint, status }: Props) {
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} right={right} hint={hint} status={status}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${INPUT_FORM} ${INPUT_STYLE}`}
      />
    </FieldContainer>
  );
}


