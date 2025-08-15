import { useEffect } from 'react';
import { useFilterStore } from '../stores/filterStore';

export function useAssertStage(expected: number, componentName?: string) {
  const stage = useFilterStore(s => s.stage);
  useEffect(() => {
    if (import.meta?.env?.DEV && stage !== expected) {
      console.warn(`[flow] ${componentName || 'screen'} mounted at stage=${stage}, expected ${expected}`);
    }
  }, [stage, expected, componentName]);
}


