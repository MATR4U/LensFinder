import { useFilterStore } from '../stores/filterStore';
import { useMemo, useCallback } from 'react';

export function useCompareSelection(max = 3) {
  const compareList = useFilterStore(s => s.compareList);
  const setCompareList = useFilterStore(s => s.setCompareList);
  const toggleCompare = useFilterStore(s => s.toggleCompare);
  const selectedCount = compareList.length;
  const atCapacity = selectedCount >= max;
  const isSelected = useCallback((id: string) => compareList.includes(id), [compareList]);
  const select = useCallback((id: string) => {
    if (compareList.includes(id)) return;
    if (compareList.length >= max) {
      const next = [...compareList];
      next[max - 1] = id;
      setCompareList(next);
    } else {
      toggleCompare(id);
    }
  }, [compareList, max, setCompareList, toggleCompare]);
  const remove = useCallback((id: string) => {
    if (!compareList.includes(id)) return;
    toggleCompare(id);
  }, [compareList, toggleCompare]);
  const ctaLabel = useCallback((id: string) => {
    if (compareList.includes(id)) return 'Remove';
    return atCapacity ? `Replace #${max}` : 'Select';
  }, [compareList, atCapacity, max]);
  return { compareList, selectedCount, atCapacity, isSelected, select, remove, ctaLabel };
}


