export type Unit = 'CHF' | 'g' | 'mm' | '%';

type Formatters = {
  format: (v: number) => string;
  parse: (input: string) => number;
  tickFormatter: (v: number) => string;
  ariaValueText: (v: number) => string;
};

function parseNumeric(input: string): number {
  const normalized = input.replace(/\s+/g, ' ').replace(/[,_]/g, '').trim();
  const num = Number(normalized.replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(num) ? num : NaN;
}

export const unitsRegistry: Record<Unit, Formatters> = {
  CHF: {
    format: (v) => `CHF ${Math.round(v)}`,
    parse: (s) => parseNumeric(s),
    tickFormatter: (v) => `CHF ${Math.round(v)}`,
    ariaValueText: (v) => `CHF ${Math.round(v)}`,
  },
  g: {
    format: (v) => `${Math.round(v)} g`,
    parse: (s) => parseNumeric(s),
    tickFormatter: (v) => `${Math.round(v)}`,
    ariaValueText: (v) => `${Math.round(v)} grams`,
  },
  mm: {
    format: (v) => `${Math.round(v)} mm`,
    parse: (s) => parseNumeric(s),
    tickFormatter: (v) => `${Math.round(v)}`,
    ariaValueText: (v) => `${Math.round(v)} millimeters`,
  },
  '%': {
    format: (v) => `${Number(v.toFixed(1))}%`,
    parse: (s) => parseNumeric(s),
    tickFormatter: (v) => `${Number(v.toFixed(1))}`,
    ariaValueText: (v) => `${Number(v.toFixed(1))} percent`,
  },
};

export function getUnitFormatters(unit: Unit): Formatters {
  return unitsRegistry[unit];
}


