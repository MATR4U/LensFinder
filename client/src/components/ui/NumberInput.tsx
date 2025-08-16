import React from 'react';

type Props = {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
  parse?: (s: string) => number;
  className?: string;
};

export default function NumberInput({ value, onChange, min, max, step: _step = 1, format, parse, className = '' }: Props) { // TODO: support step increment UI
  const [text, setText] = React.useState<string>(() => format ? format(value) : String(value));
  const debounceRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    setText(format ? format(value) : String(value));
  }, [value, format]);
  function apply(input: string) {
    const raw = parse ? parse(input) : Number(input.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(raw)) return;
    let v = raw;
    if (typeof min === 'number') v = Math.max(min, v);
    if (typeof max === 'number') v = Math.min(max, v);
    onChange(v);
  }
  return (
    <input
      type="text"
      value={text}
      onChange={(e) => {
        const val = e.target.value;
        setText(val);
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        debounceRef.current = window.setTimeout(() => apply(val), 200);
      }}
      onBlur={() => apply(text)}
      onKeyDown={(e) => { if (e.key === 'Enter') { (e.target as HTMLInputElement).blur(); } }}
      className={`w-28 rounded-md border border-[var(--control-border)] bg-[var(--control-bg)] px-2 py-1 text-sm text-[var(--text-color)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${className}`}
      inputMode="decimal"
      aria-label="Numeric value"
    />
  );
}


