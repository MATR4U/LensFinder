import React from 'react';
import { useFilteredLenses } from './useFilteredLenses';
import { useFilterStore } from '../stores/filterStore';
import type { Camera } from '../types';

export function useZeroResultsHint(camera: Camera | undefined) {
  const lenses = useFilteredLenses(camera);
  const state = useFilterStore(s => ({
    brand: s.brand,
    lensType: s.lensType,
    sealed: s.sealed,
    isMacro: s.isMacro,
  }));

  const culprit = React.useMemo(() => {
    if (lenses.length > 0) return null;
    // Cheap heuristic: relax toggles first, then type, then brand
    const checks: Array<{ key: string; when: boolean }> = [
      { key: 'sealed', when: state.sealed },
      { key: 'isMacro', when: state.isMacro },
      { key: 'lensType', when: state.lensType !== 'Any' },
      { key: 'brand', when: state.brand !== 'Any' },
    ];
    return checks.find(c => c.when)?.key ?? 'filters';
  }, [lenses.length, state]);

  return { isZero: lenses.length === 0, culprit } as const;
}


