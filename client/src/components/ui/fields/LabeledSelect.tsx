import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
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
  idPrefix?: string;
};

export default function LabeledSelect<OptionValue extends string | number = string>({ label, infoText, value, onChange, children, right, hint, status, className, idPrefix }: Props<OptionValue>) {
  return (
    <BaseLabeledField label={label} infoText={infoText} right={right} hint={hint} status={status} idPrefix={idPrefix}>
      <Select<OptionValue> value={value} onChange={onChange} className={className}>
        {children}
      </Select>
    </BaseLabeledField>
  );
}


