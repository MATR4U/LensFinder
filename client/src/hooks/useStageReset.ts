import { useCallback } from 'react';
import { useFilterStore } from '../stores/filterStore';

export function useStageReset(stageNumber: number) {
  const resetFilters = useFilterStore(s => s.resetFilters);
  const setCameraName = useFilterStore(s => s.setCameraName);
  const setSealed = useFilterStore(s => s.setSealed);
  const setIsMacro = useFilterStore(s => s.setIsMacro);
  const isPro = useFilterStore(s => s.isPro);
  const setRequireOIS = useFilterStore(s => s.setProRequireOIS);
  const setGoalPreset = useFilterStore(s => s.setGoalPreset);

  return useCallback(() => {
    resetFilters();
    // Always reset goals to the default preset (centralized)
    setGoalPreset('Balanced');
    setCameraName('Any');
    setSealed(false);
    setIsMacro(false);
    if (isPro) setRequireOIS(false);
  }, [resetFilters, setGoalPreset, setCameraName, setSealed, setIsMacro, isPro, setRequireOIS]);
}


