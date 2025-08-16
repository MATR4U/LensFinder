import React from 'react';
import { useFilterStore } from '../stores/filterStore';
import { selectEffectiveFilters } from '../stores/selectors';
import type { FiltersInput } from '../lib/filters';
import { getCachedSnapshot } from '../lib/data';
import { applyFilters } from '../lib/filters';
import type { Camera, Lens } from '../types';

export function useFilteredLenses(camera: Camera | undefined) {
  const state = useFilterStore(selectEffectiveFilters);

  const lenses = (getCachedSnapshot().lenses || []) as Lens[];

  return React.useMemo(() => {
    const input: FiltersInput = {
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
    };
    return applyFilters(input);
  }, [lenses, camera?.mount, state]);
}


