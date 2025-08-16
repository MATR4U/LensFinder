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


