import { useCallback } from 'react';
import { useFilterStore } from '../stores/filterStore';

export function useStageReset(stageNumber: number) {
  const resetFilters = useFilterStore(s => s.resetFilters);
  const setCameraName = useFilterStore(s => s.setCameraName);
  const setSealed = useFilterStore(s => s.setSealed);
  const setIsMacro = useFilterStore(s => s.setIsMacro);
  const isPro = useFilterStore(s => s.isPro);
  const setRequireOIS = useFilterStore(s => s.setProRequireOIS);

  return useCallback(() => {
    const caps = useFilterStore.getState().availabilityCaps;
    if (!caps) {
      resetFilters();
    } else {
      resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
    }
    setCameraName('Any');
    setSealed(false);
    setIsMacro(false);
    if (isPro) setRequireOIS(false);
  }, [resetFilters, setCameraName, setSealed, setIsMacro, isPro, setRequireOIS]);
}


