import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledSlider from './BaseLabeledSlider';
import { atBoundsStatus } from './status';

type Props = {
  label: string;
  infoText?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  ticks?: number[];
  snap?: boolean;
  format?: (v: number) => string;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  warningTip?: string;
  softPreference?: { checked: boolean; onChange: (v: boolean) => void; id?: string; label?: string };
  idPrefix?: string;
};

export default function LabeledSlider({ label, infoText, min, max, step, value, onChange, ticks, snap, format, right, hint, status, warningTip, softPreference, idPrefix }: Props) {
  const fieldStatus: FieldStatus | undefined = atBoundsStatus({ value: { min: value, max: value }, min, max, currentStatus: status });
  return (
    <BaseLabeledSlider
      label={label}
      infoText={infoText}
      min={min}
      max={max}
      step={step}
      singleValue={value}
      onChangeSingle={onChange}
      ticks={ticks}
      snap={snap}
      format={format}
      right={right}
      hint={hint}
      status={fieldStatus}
      warningTip={warningTip}
      softPreference={softPreference}
      idPrefix={idPrefix}
    />
  );
}


