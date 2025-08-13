import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
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
  idPrefix?: string;
};

export default function LabeledRadioGroup<V extends string | number = string>({ label, infoText, value, onChange, options, name, direction = 'row', status, hint, idPrefix }: Props<V>) {
  return (
    <BaseLabeledField label={label} infoText={infoText} hint={hint} status={status} idPrefix={idPrefix}>
      {({ labelId }) => (
        <div className={`flex ${direction === 'row' ? 'flex-row gap-4' : 'flex-col gap-2'}`}>
          {options.map((opt, idx) => {
            const autoId = React.useId();
            const id = idPrefix ? `${idPrefix}-opt-${idx}` : autoId;
            return (
              <label key={String(opt.value)} className={RADIO_LABEL_BASE} htmlFor={id}>
                <span className={RADIO_DOT_BASE}>
                  {value === opt.value && <span className={RADIO_DOT_INNER} />}
                </span>
                <input
                  id={id}
                  aria-labelledby={labelId}
                  type="radio"
                  name={name || label}
                  className="sr-only"
                  checked={value === opt.value}
                  onChange={() => onChange(opt.value)}
                />
                <span className="text-sm text-[var(--text-color)]">{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </BaseLabeledField>
  );
}


