export const formatCurrencyCHF = (v: number) => `CHF ${Math.round(v)}`;
export const formatGrams = (v: number) => `${Math.round(v)} g`;
export const formatPercent = (v: number) => `${Number(v.toFixed(1))}%`;
export const formatMm = (v: number) => `${Math.round(v)} mm`;

export function tickFormatterFromUnit(unit: 'CHF' | 'g' | 'mm' | '%') {
  if (unit === 'CHF') return (v: number) => `CHF ${Math.round(v)}`;
  if (unit === 'g') return (v: number) => `${Math.round(v)}`;
  if (unit === 'mm') return (v: number) => `${Math.round(v)}`;
  if (unit === '%') return (v: number) => `${Number(v.toFixed(1))}`;
  return (v: number) => String(v);
}

export function ticksFromBounds(min: number, max: number): number[] {
  const span = max - min;
  const q1 = min + span * 0.25;
  const q2 = min + span * 0.5;
  const q3 = min + span * 0.75;
  return [min, q1, q2, q3, max];
}

export function parseFromUnit(unit: 'CHF' | 'g' | 'mm' | '%') {
  return (input: string): number => {
    const normalized = input
      .replace(/\s+/g, ' ')
      .replace(/[,_]/g, '')
      .trim();
    const num = Number(normalized.replace(/[^0-9.+-]/g, ''));
    if (!Number.isFinite(num)) return NaN;
    return num;
  };
}


