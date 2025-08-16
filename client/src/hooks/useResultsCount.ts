import { useMemo } from 'react';
import type { Lens, Result } from '../types';
import { applyFilters, buildFilterInput } from '../lib/filters';
import { makeResultsSelector } from '../lib/selectors';

export function useBuildResultsCount(args: { lenses: Lens[]; camera: any; s: any }): number {
  const { lenses, camera, s } = args;
  return useMemo(() => {
    if (lenses.length === 0) return 0;
    const sObj = {
      lenses,
      cameraName: s.cameraName,
      brand: s.brand,
      lensType: s.lensType,
      sealed: s.sealed,
      isMacro: s.isMacro,
      priceRange: s.priceRange,
      weightRange: s.weightRange,
      proCoverage: s.proCoverage,
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: s.proRequireOIS,
      proRequireSealed: s.proRequireSealed,
      proRequireMacro: s.proRequireMacro,
      proPriceMax: 1_000_000,
      proWeightMax: 100_000,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
      softPrice: true,
      softWeight: true,
      softDistortion: true,
      softBreathing: true,
      enablePrice: false,
      enableWeight: false,
      enableDistortion: false,
      enableBreathing: false,
    };
    const filtered = applyFilters(buildFilterInput(sObj as any, camera?.mount));
    return filtered.length;
  }, [lenses, camera, s]);
}

export function useResultsCount(args: { lenses: Lens[]; camera: any; s: any }): number {
  const { lenses, camera, s } = args;
  return useMemo(() => {
    if (lenses.length === 0) return 0;
    const sObj = { ...s, lenses };
    const filtered = applyFilters(buildFilterInput(sObj as any, camera?.mount));
    return filtered.length;
  }, [lenses, camera, s]);
}

export function useResults(args: { lenses: Lens[]; camera: any; filters: any }): Result[] {
  const { lenses, camera, filters } = args;
  const selector = useMemo(() => makeResultsSelector(), []);
  return useMemo(() => selector(lenses, camera, filters), [selector, lenses, camera, filters]);
}


