import React from 'react';
import type { Camera } from '../types';
import { useAvailabilityOptions } from './useAvailabilityOptions';
import { useFilterStore } from '../stores/filterStore';
import { applyFilters, buildFilterInput } from '../lib/filters';

type Args = {
  cameras: Camera[];
  supBrands: string[];
  supLensTypes: string[];
  supCoverage: string[];
};

export function useAvailabilityCounts({ cameras, supBrands, supLensTypes, supCoverage }: Args) {
  const { lenses, camera } = useAvailabilityOptions({ cameras });
  const state = useFilterStore((s) => ({
    cameraName: s.cameraName,
    brand: s.brand,
    lensType: s.lensType,
    sealed: s.sealed,
    isMacro: s.isMacro,
    priceRange: s.priceRange,
    weightRange: s.weightRange,
    proCoverage: s.proCoverage,
    proFocalMin: s.proFocalMin,
    proFocalMax: s.proFocalMax,
    proMaxApertureF: s.proMaxApertureF,
    proRequireOIS: s.proRequireOIS,
    proRequireSealed: s.proRequireSealed,
    proRequireMacro: s.proRequireMacro,
    proPriceMax: s.proPriceMax,
    proWeightMax: s.proWeightMax,
    proDistortionMaxPct: s.proDistortionMaxPct,
    proBreathingMinScore: s.proBreathingMinScore,
  }));

  return React.useMemo(() => {
    const base: any = {
      lenses,
      cameraName: state.cameraName,
      brand: state.brand,
      lensType: state.lensType,
      sealed: state.sealed,
      isMacro: state.isMacro,
      priceRange: state.priceRange,
      weightRange: state.weightRange,
      proCoverage: state.proCoverage,
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: state.proRequireOIS,
      proRequireSealed: state.proRequireSealed,
      proRequireMacro: state.proRequireMacro,
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

    const countWith = (overrides: Partial<typeof base>, cameraNameOverride?: string, cameraMountOverride?: string) => {
      const mount = cameraNameOverride
        ? (cameras.find(c => c.name === cameraNameOverride)?.mount)
        : (camera?.mount);
      return applyFilters(buildFilterInput({ ...base, ...overrides }, mount)).length;
    };

    const brandCounts: Record<string, number> = {};
    for (const b of supBrands) brandCounts[b] = countWith({ brand: b });

    const typeCounts: Record<string, number> = {};
    for (const t of supLensTypes) typeCounts[t] = countWith({ lensType: t });

    const coverageCounts: Record<string, number> = {};
    for (const c of supCoverage) coverageCounts[c] = countWith({ proCoverage: c });

    const cameraCounts: Record<string, number> = {};
    for (const cam of cameras) cameraCounts[cam.name] = countWith({}, cam.name, cam.mount);

    return { brandCounts, typeCounts, coverageCounts, cameraCounts } as const;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify({
    lensesLen: lenses.length,
    state,
    supBrands,
    supLensTypes,
    supCoverage,
    cameras,
    cameraMount: camera?.mount,
  })]);
}


