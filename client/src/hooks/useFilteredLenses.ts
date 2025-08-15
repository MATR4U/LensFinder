import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import { getCachedSnapshot } from '../lib/data';
import { applyFilters } from '../lib/filters';
import type { Camera, Lens } from '../types';

export function useFilteredLenses(camera: Camera | undefined) {
  const state = useFilterStore(s => ({
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
    enablePrice: s.enablePrice,
    enableWeight: s.enableWeight,
    enableDistortion: s.enableDistortion,
    enableBreathing: s.enableBreathing,
    softPrice: s.softPrice,
    softWeight: s.softWeight,
    softDistortion: s.softDistortion,
    softBreathing: s.softBreathing,
  }));

  const lenses = (getCachedSnapshot().lenses || []) as Lens[];

  return React.useMemo(() => {
    return applyFilters({
      lenses,
      cameraName: state.cameraName,
      cameraMount: camera?.mount,
      brand: state.brand,
      lensType: state.lensType,
      sealed: state.sealed,
      isMacro: state.isMacro,
      priceRange: state.priceRange,
      weightRange: state.weightRange,
      proCoverage: state.proCoverage,
      proFocalMin: state.proFocalMin,
      proFocalMax: state.proFocalMax,
      proMaxApertureF: state.proMaxApertureF,
      proRequireOIS: state.proRequireOIS,
      proRequireSealed: state.proRequireSealed,
      proRequireMacro: state.proRequireMacro,
      proPriceMax: state.proPriceMax,
      proWeightMax: state.proWeightMax,
      proDistortionMaxPct: state.proDistortionMaxPct,
      proBreathingMinScore: state.proBreathingMinScore,
      enablePrice: state.enablePrice,
      enableWeight: state.enableWeight,
      enableDistortion: state.enableDistortion,
      enableBreathing: state.enableBreathing,
      softPrice: state.softPrice,
      softWeight: state.softWeight,
      softDistortion: state.softDistortion,
      softBreathing: state.softBreathing,
    });
  }, [lenses, camera?.mount, state]);
}


