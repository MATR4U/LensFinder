import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import Select from '../Select';

type Props<OptionValue extends string | number = string> = {
  label: string;
  infoText?: string;
  value: OptionValue;
  onChange: (v: OptionValue) => void;
  children: React.ReactNode; // <option> elements
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  className?: string; // for Select
};

export default function LabeledSelect<OptionValue extends string | number = string>({ label, infoText, value, onChange, children, right, hint, status, className }: Props<OptionValue>) {
  return (
    <FieldContainer
      label={label}
      info={infoText ? <Info text={infoText} /> : undefined}
      right={right}
      hint={hint}
      status={status}
    >
      <Select<OptionValue> value={value} onChange={onChange} className={className}>
        {children}
      </Select>
    </FieldContainer>
  );
}


