import { useFilterStore } from './filterStore';

export const selectProFlags = (s: ReturnType<typeof useFilterStore.getState>) => ({
  isPro: s.isPro,
  proCoverage: s.proCoverage,
  proFocalMin: s.proFocalMin,
  proFocalMax: s.proFocalMax,
  proMaxApertureF: s.proMaxApertureF,
  proRequireOIS: s.proRequireOIS,
  proRequireSealed: s.proRequireSealed,
  proRequireMacro: s.proRequireMacro,
});

export const selectPrimaryFilters = (s: ReturnType<typeof useFilterStore.getState>) => ({
  cameraName: s.cameraName,
  brand: s.brand,
  lensType: s.lensType,
  sealed: s.sealed,
  isMacro: s.isMacro,
});

export const selectRangeFilters = (s: ReturnType<typeof useFilterStore.getState>) => ({
  priceRange: s.priceRange,
  weightRange: s.weightRange,
  proPriceMax: s.proPriceMax,
  proWeightMax: s.proWeightMax,
  proDistortionMaxPct: s.proDistortionMaxPct,
  proBreathingMinScore: s.proBreathingMinScore,
});


