import React from 'react';
import { SELECT_FORM, SELECT_STYLE } from './styles';

type Props<OptionValue extends string | number = string> = {
  value: OptionValue;
  onChange: (v: OptionValue) => void;
  children: React.ReactNode;
  className?: string;
  selectProps?: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'>;
  ariaLabelledBy?: string;
};

export default function Select<OptionValue extends string | number = string>({ value, onChange, children, className = '', selectProps, ariaLabelledBy }: Props<OptionValue>) {
  return (
    <select
      value={value as any}
      onChange={(e) => onChange(e.target.value as OptionValue)}
      className={`${SELECT_FORM} ${SELECT_STYLE} ${className}`}
      aria-labelledby={ariaLabelledBy}
      {...selectProps}
    >
      {children}
    </select>
  );
}



