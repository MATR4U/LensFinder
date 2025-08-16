import type { Availability } from '../types/availability';
import type { Range } from './ranges';
import { rangesEqual } from './ranges';

type Key = 'brands' | 'lensTypes' | 'coverage';

export function isOptionEnabled(avail: Availability, key: Key, value: string): boolean {
  const list = avail[key];
  if (value === 'Any') return true;
  return list.includes(value);
}

export function buildOptionsWithCounts(
  key: Key,
  supers: string[],
  avail: Availability,
  counts: { brandCounts: Record<string, number>; typeCounts: Record<string, number>; coverageCounts: Record<string, number> }
) {
  const countsMap = key === 'brands' ? counts.brandCounts : key === 'lensTypes' ? counts.typeCounts : counts.coverageCounts;
  const enabled = avail[key];
  return supers.map(v => ({ value: v, label: v, count: countsMap[v] ?? 0, disabled: v !== 'Any' && !enabled.includes(v) }));
}

export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export type AvailabilityCaps = {
  brands: string[];
  lensTypes: string[];
  coverage: string[];
  priceBounds: Range;
  priceTicks?: number[];
  weightBounds: Range;
  weightTicks?: number[];
  focalBounds: Range;
  focalTicks?: number[];
  apertureMaxMax: number;
  distortionMaxMax: number;
  breathingMinMin: number;
};

export function availabilityCapsEqual(x: AvailabilityCaps, y: AvailabilityCaps): boolean {
  return (
    arraysEqual(x.brands, y.brands) &&
    arraysEqual(x.lensTypes, y.lensTypes) &&
    arraysEqual(x.coverage, y.coverage) &&
    rangesEqual(x.priceBounds, y.priceBounds) &&
    ((x.priceTicks && y.priceTicks) ? arraysEqual(x.priceTicks as unknown as number[], y.priceTicks as unknown as number[]) : x.priceTicks === y.priceTicks) &&
    rangesEqual(x.weightBounds, y.weightBounds) &&
    ((x.weightTicks && y.weightTicks) ? arraysEqual(x.weightTicks as unknown as number[], y.weightTicks as unknown as number[]) : x.weightTicks === y.weightTicks) &&
    rangesEqual(x.focalBounds, y.focalBounds) &&
    x.apertureMaxMax === y.apertureMaxMax &&
    x.distortionMaxMax === y.distortionMaxMax &&
    x.breathingMinMin === y.breathingMinMin
  );
}

// Compute a stable, order-insensitive fingerprint string for caps
export function availabilityCapsVersion(c: AvailabilityCaps): string {
  const sortedNumbers = (arr?: number[]) => (arr ? [...arr].sort((a, b) => a - b) : undefined);
  const sortedStrings = (arr: string[]) => [...arr].sort();
  const stable = {
    brands: sortedStrings(c.brands),
    lensTypes: sortedStrings(c.lensTypes),
    coverage: sortedStrings(c.coverage),
    priceBounds: c.priceBounds,
    priceTicks: sortedNumbers(c.priceTicks),
    weightBounds: c.weightBounds,
    weightTicks: sortedNumbers(c.weightTicks),
    focalBounds: c.focalBounds,
    focalTicks: sortedNumbers(c.focalTicks),
    apertureMaxMax: c.apertureMaxMax,
    distortionMaxMax: c.distortionMaxMax,
    breathingMinMin: c.breathingMinMin,
  } as const;
  return JSON.stringify(stable);
}


