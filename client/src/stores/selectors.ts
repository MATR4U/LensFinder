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

// Apply availability caps on read for range-like and max/min constraints
export const selectEffectiveFilters = (s: ReturnType<typeof useFilterStore.getState>) => {
  const caps = s.availabilityCaps;
  const priceRange = caps
    ? { min: Math.max(s.priceRange.min, caps.priceBounds.min), max: Math.min(s.priceRange.max, caps.priceBounds.max) }
    : s.priceRange;
  const weightRange = caps
    ? { min: Math.max(s.weightRange.min, caps.weightBounds.min), max: Math.min(s.weightRange.max, caps.weightBounds.max) }
    : s.weightRange;
  const proFocalMin = caps ? Math.max(s.proFocalMin, caps.focalBounds.min) : s.proFocalMin;
  const proFocalMax = caps ? Math.min(s.proFocalMax, caps.focalBounds.max) : s.proFocalMax;
  const proMaxApertureF = caps ? Math.min(s.proMaxApertureF, caps.apertureMaxMax) : s.proMaxApertureF;
  const proPriceMax = caps ? Math.min(s.proPriceMax, caps.priceBounds.max) : s.proPriceMax;
  const proWeightMax = caps ? Math.min(s.proWeightMax, caps.weightBounds.max) : s.proWeightMax;
  const proDistortionMaxPct = caps ? Math.min(s.proDistortionMaxPct, caps.distortionMaxMax) : s.proDistortionMaxPct;
  const proBreathingMinScore = caps ? Math.max(s.proBreathingMinScore, caps.breathingMinMin) : s.proBreathingMinScore;
  return {
    cameraName: s.cameraName,
    brand: s.brand,
    lensType: s.lensType,
    sealed: s.sealed,
    isMacro: s.isMacro,
    priceRange,
    weightRange,
    proCoverage: s.proCoverage,
    proFocalMin,
    proFocalMax,
    proMaxApertureF,
    proRequireOIS: s.proRequireOIS,
    proRequireSealed: s.proRequireSealed,
    proRequireMacro: s.proRequireMacro,
    proPriceMax,
    proWeightMax,
    proDistortionMaxPct,
    proBreathingMinScore,
    softPrice: s.softPrice,
    softWeight: s.softWeight,
    softDistortion: s.softDistortion,
    softBreathing: s.softBreathing,
    enablePrice: s.enablePrice,
    enableWeight: s.enableWeight,
    enableDistortion: s.enableDistortion,
    enableBreathing: s.enableBreathing,
  };
};

// Non-breaking normalized adapter (read-only): projects flat store to a consistent filters shape
export const selectNormalizedFilters = (s: ReturnType<typeof useFilterStore.getState>) => {
  const eff = selectEffectiveFilters(s);
  return {
    selection: {
      brand: eff.brand,
      lensType: eff.lensType,
      sealedRequired: eff.sealed,
      macroRequired: eff.isMacro,
    },
    criteria: {
      price: { mode: eff.enablePrice ? (eff.softPrice ? 'soft' : 'hard') : 'off', range: { min: eff.priceRange.min, max: eff.priceRange.max } },
      weight: { mode: eff.enableWeight ? (eff.softWeight ? 'soft' : 'hard') : 'off', range: { min: eff.weightRange.min, max: eff.weightRange.max } },
      focal: { mode: 'soft', range: { min: eff.proFocalMin, max: eff.proFocalMax } },
      aperture: { mode: 'soft', max: eff.proMaxApertureF },
      distortion: { mode: eff.enableDistortion ? (eff.softDistortion ? 'soft' : 'hard') : 'off', max: eff.proDistortionMaxPct },
      breathing: { mode: eff.enableBreathing ? (eff.softBreathing ? 'soft' : 'hard') : 'off', min: eff.proBreathingMinScore },
      oisRequired: eff.proRequireOIS,
      sealedRequired: eff.proRequireSealed,
      macroRequired: eff.proRequireMacro,
      priceMax: eff.proPriceMax,
      weightMax: eff.proWeightMax,
    },
    global: {
      // Placeholders for future normalization
    },
  } as const;
};

// Selector that returns a ready FiltersInput for lib/filters.applyFilters
export const selectFiltersInput = (s: ReturnType<typeof useFilterStore.getState>) => {
  const eff = selectEffectiveFilters(s);
  return {
    cameraName: eff.cameraName,
    brand: eff.brand,
    lensType: eff.lensType,
    sealed: eff.sealed,
    isMacro: eff.isMacro,
    priceRange: eff.priceRange,
    weightRange: eff.weightRange,
    proCoverage: eff.proCoverage,
    proFocalMin: eff.proFocalMin,
    proFocalMax: eff.proFocalMax,
    proMaxApertureF: eff.proMaxApertureF,
    proRequireOIS: eff.proRequireOIS,
    proRequireSealed: eff.proRequireSealed,
    proRequireMacro: eff.proRequireMacro,
    proPriceMax: eff.proPriceMax,
    proWeightMax: eff.proWeightMax,
    proDistortionMaxPct: eff.proDistortionMaxPct,
    proBreathingMinScore: eff.proBreathingMinScore,
    softPrice: eff.softPrice,
    softWeight: eff.softWeight,
    softDistortion: eff.softDistortion,
    softBreathing: eff.softBreathing,
    enablePrice: eff.enablePrice,
    enableWeight: eff.enableWeight,
    enableDistortion: eff.enableDistortion,
    enableBreathing: eff.enableBreathing,
  };
};

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

export const selectPrimaryAndPro = (s: ReturnType<typeof useFilterStore.getState>) => ({
  cameraName: s.cameraName,
  isPro: s.isPro,
  goalPreset: s.goalPreset,
  goalWeights: s.goalWeights,
  focalChoice: s.focalChoice,
  subjectDistanceM: s.subjectDistanceM,
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
  softPrice: s.softPrice,
  softWeight: s.softWeight,
  softDistortion: s.softDistortion,
  softBreathing: s.softBreathing,
  enablePrice: s.enablePrice,
  enableWeight: s.enableWeight,
  enableDistortion: s.enableDistortion,
  enableBreathing: s.enableBreathing,
  compareList: s.compareList,
  selected: s.selected,
  report: s.report,
  setReport: s.setReport,
});

export const selectHistory = (s: ReturnType<typeof useFilterStore.getState>) => ({
  historyLength: s.historyLength,
  redoLength: s.redoLength,
  undoLastFilter: s.undoLastFilter,
  redoLastFilter: s.redoLastFilter,
});

export const selectCompareState = (s: ReturnType<typeof useFilterStore.getState>) => ({
  compareList: s.compareList,
  setCompareList: s.setCompareList,
  toggleCompare: s.toggleCompare,
  clearCompare: s.clearCompare,
  setSelected: s.setSelected,
});


