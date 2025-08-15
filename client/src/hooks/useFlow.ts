import { useMemo } from 'react';
import { useFilterStore } from '../stores/filterStore';

export function useFlow() {
  const stage = useFilterStore(s => s.stage);
  const continueTo = useFilterStore(s => s.continueTo);
  const setStage = useFilterStore(s => s.setStage);
  const compareCount = useFilterStore(s => s.compareList.length);
  const canBack = stage > 0;
  const canForward = useMemo(() => {
    if (stage === 0) return true; // Mode → Build
    if (stage === 1) return true; // Build → Tune
    if (stage === 2) return true; // Tune → Results (Compare grid) should not be gated
    if (stage === 3) return compareCount >= 2; // Compare → Report requires 2 selections
    return false;
  }, [stage, compareCount]);
  const continueLabel = useMemo(() => {
    if (stage === 2) return `See results (${compareCount})`;
    if (stage === 3) return 'View Report';
    return 'Continue';
  }, [stage, compareCount]);
  return { stage, canBack, canForward, continueLabel, continueTo, setStage };
}


