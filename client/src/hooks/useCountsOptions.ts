import React from 'react';
import type { Availability } from '../types/availability';

type Key = 'brands' | 'lensTypes' | 'coverage';

export function useCountsOptions(key: Key, supers: string[], avail: Availability, counts: Record<string, Record<string, number>>) {
  return React.useMemo(() => {
    const enabled = avail[key];
    return supers.map(v => ({
      value: v,
      label: v,
      count: counts[key === 'brands' ? 'brandCounts' : key === 'lensTypes' ? 'typeCounts' : 'coverageCounts'][v] ?? 0,
      disabled: v !== 'Any' && !enabled.includes(v)
    }));
  }, [key, supers, avail, counts]);
}


