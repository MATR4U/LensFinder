import React from 'react';
import FieldContainer, { type FieldStatus } from './FieldContainer';
import Info from '../Info';
import { RADIO_LABEL_BASE, RADIO_DOT_BASE, RADIO_DOT_INNER } from '../styles';

export type RadioOption<V extends string | number = string> = { value: V; label: string };

type Props<V extends string | number = string> = {
  label: string;
  infoText?: string;
  value: V;
  onChange: (v: V) => void;
  options: RadioOption<V>[];
  name?: string;
  direction?: 'row' | 'col';
  status?: FieldStatus;
  hint?: string;
};

export default function LabeledRadioGroup<V extends string | number = string>({ label, infoText, value, onChange, options, name, direction = 'row', status, hint }: Props<V>) {
  return (
    <FieldContainer label={label} info={infoText ? <Info text={infoText} /> : undefined} hint={hint} status={status}>
      <div className={`flex ${direction === 'row' ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
        {options.map(opt => (
          <label key={String(opt.value)} className={RADIO_LABEL_BASE}>
            <span className={RADIO_DOT_BASE}>
              {value === opt.value && <span className={RADIO_DOT_INNER} />}
            </span>
            <input
              type="radio"
              name={name || label}
              className="sr-only"
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            <span className="text-sm text-[var(--text-color)]">{opt.label}</span>
          </label>
        ))}
      </div>
    </FieldContainer>
  );
}


