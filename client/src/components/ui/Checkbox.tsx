import React from 'react';
import { CHECKBOX_FORM, CHECKBOX_STYLE, CHECKBOX_WRAPPER } from './styles';

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'>;
};

export default function Checkbox({ checked, onChange, className = '', inputProps }: Props) {
  return (
    <span className={`${CHECKBOX_WRAPPER} ${className}`}>
      <input
        type="checkbox"
        className={`${CHECKBOX_FORM} ${CHECKBOX_STYLE}`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...inputProps}
      />
    </span>
  );
}



