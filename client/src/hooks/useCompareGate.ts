import { useFilterStore } from '../stores/filterStore';
import { useMemo } from 'react';

export function useCompareGate() {
  const selectedCount = useFilterStore(s => s.compareList.length);
  const canCompare = useMemo(() => selectedCount >= 2, [selectedCount]);
  return { selectedCount, canCompare };
}


