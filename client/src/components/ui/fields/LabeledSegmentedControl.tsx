import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import { SEGMENT_GROUP_BASE, SEGMENT_BASE, SEGMENT_ACTIVE } from '../styles';

export type SegmentOption<V extends string | number = string> = { value: V; label: string };

type Props<V extends string | number = string> = {
  label: string;
  infoText?: string;
  value: V;
  onChange: (v: V) => void;
  options: SegmentOption<V>[];
  status?: FieldStatus;
  hint?: string;
};

export default function LabeledSegmentedControl<V extends string | number = string>({ label, infoText, value, onChange, options, status, hint }: Props<V>) {
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} status={status} hint={hint}>
      <div className={SEGMENT_GROUP_BASE} role="radiogroup" aria-label={label}>
        {options.map(opt => (
          <label key={String(opt.value)} className={`${SEGMENT_BASE} ${value === opt.value ? SEGMENT_ACTIVE : ''} cursor-pointer`}>
            <input
              type="radio"
              className="sr-only"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              aria-checked={value === opt.value}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </FieldContainer>
  );
}


