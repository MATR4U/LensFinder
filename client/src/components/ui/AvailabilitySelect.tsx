import React from 'react';
import LabeledSelect from './fields/LabeledSelect';

export type AvailabilityOption = {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
};

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: AvailabilityOption[];
};

export default function AvailabilitySelect({ label, value, onChange, options }: Props) {
  return (
    <LabeledSelect label={label} value={value} onChange={onChange}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value} disabled={!!opt.disabled}>
          {opt.count != null ? `${opt.label} (${opt.count})` : opt.label}
        </option>
      ))}
    </LabeledSelect>
  );
}


