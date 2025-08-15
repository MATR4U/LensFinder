import { useMemo } from 'react';
import { useFilterStore } from '../stores/filterStore';
import type { Result } from '../types';
import { resultId } from '../lib/ids';

export function useSelectedResults(results: Result[]) {
  const compareList = useFilterStore(s => s.compareList);
  return useMemo(() => {
    if (compareList.length === 0) return [] as Result[];
    const map = new Map(results.map(r => [resultId(r), r] as const));
    return compareList.map(id => map.get(id)).filter(Boolean) as Result[];
  }, [results, compareList]);
}


