import React from 'react';
import { type FieldStatus } from './FieldContainer';
import BaseLabeledField from './BaseLabeledField';
import { INPUT_FORM, INPUT_STYLE } from '../styles';

type Props = {
  label: string;
  infoText?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  right?: React.ReactNode;
  hint?: string;
  status?: FieldStatus;
  idPrefix?: string;
  format?: (v: number) => string;
  parse?: (s: string) => number;
};

export default function LabeledNumberField({ label, infoText, value, onChange, min, max, step: _step, placeholder, right, hint, status, idPrefix, format, parse }: Props) { // TODO: add +/- stepper buttons using step
  const [text, setText] = React.useState<string>(() => (Number.isFinite(value) ? (format ? format(value) : String(value)) : ''));
  React.useEffect(() => {
    setText(Number.isFinite(value) ? (format ? format(value) : String(value)) : '');
  }, [value, format]);
  function apply(raw: string) {
    const parsed = parse ? parse(raw) : Number(raw.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(parsed)) return;
    let v = parsed as number;
    if (typeof min === 'number') v = Math.max(min, v);
    if (typeof max === 'number') v = Math.min(max, v);
    onChange(v);
  }
  return (
    <BaseLabeledField label={label} infoText={infoText} right={right} hint={hint} status={status} idPrefix={idPrefix}>
      {({ inputId, labelId }) => (
        <input
          id={inputId}
          aria-labelledby={labelId}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => apply(text)}
          onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
          min={min}
          max={max}
          placeholder={placeholder}
          className={`${INPUT_FORM} ${INPUT_STYLE}`}
          inputMode="decimal"
        />
      )}
    </BaseLabeledField>
  );
}


