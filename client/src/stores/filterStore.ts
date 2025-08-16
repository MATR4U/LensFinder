import { createWithEqualityFn } from 'zustand/traditional';
import { persist } from 'zustand/middleware';
import type { ReportResponse } from '../lib/api';
import type { Result } from '../types';
import { createJourneySlice } from './filterStore/slices/journeySlice';
import { createSimpleFiltersSlice } from './filterStore/slices/simpleFiltersSlice';
import { createProFiltersSlice } from './filterStore/slices/proFiltersSlice';
import { createGoalsSlice } from './filterStore/slices/goalsSlice';
import { createAvailabilitySlice } from './filterStore/slices/availabilitySlice';
import { createHistorySlice } from './filterStore/slices/historySlice';
import { createResetsSlice } from './filterStore/slices/resetsSlice';
import { createCompareSlice } from './filterStore/slices/compareSlice';
import { createReportSlice } from './filterStore/slices/reportSlice';
import { createPricingSlice } from './filterStore/slices/pricingSlice';

export type Range = { min: number; max: number };

export interface FilterState {
  // Journey
  stage: number;
  setStage: (n: number) => void;
  continueTo: (n: number) => void;
  advance: (n: number) => void;
  // Camera selection
  cameraName: string;
  setCameraName: (name: string) => void;
  // Mode
  isPro: boolean;

  // Simple filters
  brand: string;
  lensType: string;
  sealed: boolean;
  isMacro: boolean;
  priceRange: Range;
  weightRange: Range;

  // Pro filters
  proCoverage: string;
  proFocalMin: number;
  proFocalMax: number;
  proMaxApertureF: number;
  proRequireOIS: boolean;
  proRequireSealed: boolean;
  proRequireMacro: boolean;
  proPriceMax: number;
  proWeightMax: number;
  proDistortionMaxPct: number;
  proBreathingMinScore: number;
  // Soft vs hard toggles
  softPrice: boolean;
  softWeight: boolean;
  softDistortion: boolean;
  softBreathing: boolean;
  // Per-filter enabled flags (Off disables hard filter application)
  enablePrice: boolean;
  enableWeight: boolean;
  enableDistortion: boolean;
  enableBreathing: boolean;

  // Goals
  goalPreset: string;
  goalWeights: Record<string, number>;

  // Global scoring inputs
  focalChoice: number;
  subjectDistanceM: number;
  setFocalChoice: (n: number) => void;
  setSubjectDistanceM: (n: number) => void;

  // Availability caps (for clamping)
  availabilityCaps?: {
    brands: string[];
    lensTypes: string[];
    coverage: string[];
    priceBounds: Range;
    priceTicks?: number[];
    weightBounds: Range;
    weightTicks?: number[];
    focalBounds: Range;
    focalTicks?: number[];
    apertureMaxMax: number;
    distortionMaxMax: number;
    breathingMinMin: number;
  };

  // Actions
  setIsPro: (v: boolean) => void;
  setBrand: (v: string) => void;
  setLensType: (v: string) => void;
  setSealed: (v: boolean) => void;
  setIsMacro: (v: boolean) => void;
  setPriceRange: (r: Range) => void;
  setWeightRange: (r: Range) => void;

  setProCoverage: (v: string) => void;
  setProFocalMin: (n: number) => void;
  setProFocalMax: (n: number) => void;
  setProMaxApertureF: (n: number) => void;
  setProRequireOIS: (v: boolean) => void;
  setProRequireSealed: (v: boolean) => void;
  setProRequireMacro: (v: boolean) => void;
  setProPriceMax: (n: number) => void;
  setProWeightMax: (n: number) => void;
  setProDistortionMaxPct: (n: number) => void;
  setProBreathingMinScore: (n: number) => void;
  setSoftPrice: (v: boolean) => void;
  setSoftWeight: (v: boolean) => void;
  setSoftDistortion: (v: boolean) => void;
  setSoftBreathing: (v: boolean) => void;
  setEnablePrice: (v: boolean) => void;
  setEnableWeight: (v: boolean) => void;
  setEnableDistortion: (v: boolean) => void;
  setEnableBreathing: (v: boolean) => void;

  setGoalPreset: (p: string) => void;
  setGoalWeights: (w: Record<string, number>) => void;

  setAvailabilityCaps: (caps: FilterState['availabilityCaps']) => void;
  setBoundsFromAvailability: (a: NonNullable<FilterState['availabilityCaps']>) => void;

  resetFilters: (availability?: {
    priceBounds: Range;
    weightBounds: Range;
  }) => void;
  resetAll: () => void;

  // Stage-scoped baselines and resets
  captureStageBaseline: (stage: number, opts?: { resetOnEntry?: boolean }) => void;
  resetToStageBaseline: (stage?: number) => void;

  // History
  pushHistory: () => void;
  undoLastFilter: () => void;
  redoLastFilter: () => void;
  historyLength: number;
  redoLength: number;

  // Report state
  report: ReportResponse | null;
  setReport: (r: ReportResponse | null) => void;

  // Cross-step UI state
  selected: Result | null;
  setSelected: (r: Result | null) => void;
  compareList: string[];
  setCompareList: (ids: string[]) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  // Pricing overrides (UI/data aid)
  priceOverrides: Record<string, string>;
  setPriceOverrides: (overrides: Record<string, string>) => void;
}

export const useFilterStore = createWithEqualityFn<FilterState>()(persist((set, get) => ({
  ...createJourneySlice(set, get),
  ...createSimpleFiltersSlice(set, get),
  ...createProFiltersSlice(set, get),
  ...createGoalsSlice(set, get),
  ...createAvailabilitySlice(set, get),
  ...createResetsSlice(set, get),
  ...createHistorySlice(set, get),
  ...createCompareSlice(set, get),
  ...createReportSlice(set),
  ...createPricingSlice(set),
}), {
  name: 'camera-filter-storage',
  version: 3,
  migrate: (persisted: any) => {
    if (persisted && typeof persisted === 'object') {
      if ('stage' in persisted) delete persisted.stage;
      // Do not persist compare selections across sessions
      if ('compareList' in persisted) delete persisted.compareList;
      if ('selected' in persisted) delete persisted.selected;
      // v3 migration scaffold: normalize legacy 'Any' and sentinels in-place (non-breaking)
      const normalizeAny = (v: any, anyValue: any) => (v === 'Any' ? anyValue : v);
      if ('brand' in persisted) persisted.brand = normalizeAny(persisted.brand, 'Any');
      if ('lensType' in persisted) persisted.lensType = normalizeAny(persisted.lensType, 'Any');
    }
    return persisted;
  },
  partialize: (state) => ({
    // stage intentionally not persisted; always start at 0
    cameraName: state.cameraName,
    isPro: state.isPro,
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
    goalPreset: state.goalPreset,
    goalWeights: state.goalWeights,
    focalChoice: state.focalChoice,
    subjectDistanceM: state.subjectDistanceM,
    // Intentionally do not persist compare selections or current selection
    // Do not persist availability caps, history, or report
  }),
}));

// URL sync moved to UI hook: useUrlFiltersSync()


