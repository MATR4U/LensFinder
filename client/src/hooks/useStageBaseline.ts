import { useCallback } from 'react';
import { useFilterStore } from '../stores/filterStore';

export function useStageBaseline(stageNumber: number) {
  const captureStageBaseline = useFilterStore((s) => s.captureStageBaseline);
  const resetToStageBaseline = useFilterStore((s) => s.resetToStageBaseline);
  const hasBaseline = !!(useFilterStore.getState() as any)[`__baseline_${stageNumber}__`];

  const capture = useCallback((opts?: { resetOnEntry?: boolean }) => {
    captureStageBaseline(stageNumber, opts);
  }, [captureStageBaseline, stageNumber]);

  const reset = useCallback(() => {
    resetToStageBaseline(stageNumber);
  }, [resetToStageBaseline, stageNumber]);

  return { capture, reset, hasBaseline } as const;
}


