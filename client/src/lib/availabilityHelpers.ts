import type { Availability } from '../types/availability';

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


