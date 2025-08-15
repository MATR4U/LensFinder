import { createWithEqualityFn } from 'zustand/traditional';
import { persist } from 'zustand/middleware';
import { PRESETS } from '../lib/recommender';
import type { ReportResponse } from '../lib/api';
import type { Result } from '../types';

export type Range = { min: number; max: number };

function rangesEqual(a: Range, b: Range): boolean {
  return a.min === b.min && a.max === b.max;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function availabilityCapsEqual(
  x: NonNullable<FilterState['availabilityCaps']>,
  y: NonNullable<FilterState['availabilityCaps']>
): boolean {
  return (
    arraysEqual(x.brands, y.brands) &&
    arraysEqual(x.lensTypes, y.lensTypes) &&
    arraysEqual(x.coverage, y.coverage) &&
    rangesEqual(x.priceBounds, y.priceBounds) &&
    ((x.priceTicks && y.priceTicks) ? arraysEqual(x.priceTicks as unknown as string[], y.priceTicks as unknown as string[]) : x.priceTicks === y.priceTicks) &&
    rangesEqual(x.weightBounds, y.weightBounds) &&
    ((x.weightTicks && y.weightTicks) ? arraysEqual(x.weightTicks as unknown as string[], y.weightTicks as unknown as string[]) : x.weightTicks === y.weightTicks) &&
    rangesEqual(x.focalBounds, y.focalBounds) &&
    x.apertureMaxMax === y.apertureMaxMax &&
    x.distortionMaxMax === y.distortionMaxMax &&
    x.breathingMinMin === y.breathingMinMin
  );
}

export interface FilterState {
  // Journey
  stage: number;
  setStage: (n: number) => void;
  continueTo: (n: number) => void;
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
  // Journey
  stage: 0,
  setStage: (n) => {
    const allowed = [0,1,2,3,4];
    if (!allowed.includes(n)) {
      if (import.meta?.env?.DEV) console.warn('[flow] setStage blocked: invalid stage', n);
      return;
    }
    get().pushHistory();
    set({ stage: n });
  },
  continueTo: (next) => {
    const cur = get().stage;
    const allowedForward = { 0: 1, 1: 2, 2: 3, 3: 4 } as Record<number, number>;
    const allowedBackward = { 1: 0, 2: 1, 3: 2, 4: 3 } as Record<number, number>;
    const isForward = next > cur;
    const ok = (isForward ? allowedForward[cur] === next : allowedBackward[cur] === next);
    if (!ok) {
      if (import.meta?.env?.DEV) console.warn('[flow] continueTo blocked: ', { cur, next });
      return;
    }
    // Guard: require at least 2 selections to enter Report (4). Stage 3 (results grid) remains accessible to build selections.
    if (next >= 4 && get().compareList.length < 2) {
      if (import.meta?.env?.DEV) console.warn('[flow] blocked: need at least 2 selections');
      return;
    }
    get().pushHistory();
    set({ stage: next });
  },
  // Initial State
  cameraName: 'Any',
  setCameraName: (name) => set({ cameraName: name }),
  isPro: true,

  brand: 'Any',
  lensType: 'Any',
  sealed: false,
  isMacro: false,
  // Start unconstrained; availability caps will narrow these
  priceRange: { min: 0, max: 1_000_000 },
  weightRange: { min: 0, max: 100_000 },

  proCoverage: 'Any',
  proFocalMin: 0,
  proFocalMax: 9999,
  proMaxApertureF: 99,
  proRequireOIS: false,
  proRequireSealed: false,
  proRequireMacro: false,
  // Large sentinels; availability caps will narrow
  proPriceMax: 1_000_000,
  proWeightMax: 100_000,
  proDistortionMaxPct: 100,
  proBreathingMinScore: 0,
  softPrice: false,
  softWeight: false,
  softDistortion: false,
  softBreathing: false,
  enablePrice: true,
  enableWeight: true,
  enableDistortion: true,
  enableBreathing: true,

  goalPreset: 'Balanced',
  goalWeights: { ...PRESETS['Balanced'] },

  focalChoice: 50,
  subjectDistanceM: 3.0,
  setFocalChoice: (n) => set({ focalChoice: n }),
  setSubjectDistanceM: (n) => set({ subjectDistanceM: n }),

   availabilityCaps: undefined,

  // Actions
  setIsPro: (v) => { get().pushHistory(); set({ isPro: v }); },
  setBrand: (v) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const next = caps && !caps.brands.includes(v) ? 'Any' : v;
    set({ brand: next });
  },
  setLensType: (v) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const next = caps && !caps.lensTypes.includes(v) ? 'Any' : v;
    set({ lensType: next });
  },
  setSealed: (v) => { get().pushHistory(); set({ sealed: v }); },
  setIsMacro: (v) => { get().pushHistory(); set({ isMacro: v }); },
  setPriceRange: (r) => {
    const anyState = get() as unknown as Record<string, any>;
    const timerKey = '__priceRangeTimer__' as unknown as keyof FilterState;
    if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
    const t = setTimeout(() => {
      const caps = get().availabilityCaps;
      const bounds = caps?.priceBounds;
      const min = Math.min(r.min, r.max);
      const max = Math.max(r.min, r.max);
      const clamped = bounds
        ? { min: Math.max(bounds.min, min), max: Math.min(bounds.max, max) }
        : { min, max };
      get().pushHistory();
      set({ priceRange: clamped });
    }, 200);
    set({ [timerKey]: t } as unknown as Partial<FilterState>);
  },
  setWeightRange: (r) => {
    const anyState = get() as unknown as Record<string, any>;
    const timerKey = '__weightRangeTimer__' as unknown as keyof FilterState;
    if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
    const t = setTimeout(() => {
      const caps = get().availabilityCaps;
      const bounds = caps?.weightBounds;
      const min = Math.min(r.min, r.max);
      const max = Math.max(r.min, r.max);
      const clamped = bounds
        ? { min: Math.max(bounds.min, min), max: Math.min(bounds.max, max) }
        : { min, max };
      get().pushHistory();
      set({ weightRange: clamped });
    }, 200);
    set({ [timerKey]: t } as unknown as Partial<FilterState>);
  },

  setProCoverage: (v) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const next = caps && !caps.coverage.includes(v) ? 'Any' : v;
    set({ proCoverage: next });
  },
  setProFocalMin: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const fb = caps?.focalBounds;
    const max = get().proFocalMax;
    let val = n;
    if (fb) val = Math.min(Math.max(n, fb.min), fb.max);
    if (val > max) val = max;
    set({ proFocalMin: val });
  },
  setProFocalMax: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const fb = caps?.focalBounds;
    const min = get().proFocalMin;
    let val = n;
    if (fb) val = Math.min(Math.max(n, fb.min), fb.max);
    if (val < min) val = min;
    set({ proFocalMax: val });
  },
  setProMaxApertureF: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const apMax = caps?.apertureMaxMax ?? 99;
    const val = Math.min(Math.max(n, 0.7), apMax);
    set({ proMaxApertureF: val });
  },
  setProRequireOIS: (v) => { get().pushHistory(); set({ proRequireOIS: v }); },
  setProRequireSealed: (v) => { get().pushHistory(); set({ proRequireSealed: v }); },
  setProRequireMacro: (v) => { get().pushHistory(); set({ proRequireMacro: v }); },
  setProPriceMax: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const b = caps?.priceBounds;
    const val = b ? Math.min(Math.max(n, b.min), b.max) : Math.max(0, n);
    set({ proPriceMax: val });
  },
  setProWeightMax: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const b = caps?.weightBounds;
    const val = b ? Math.min(Math.max(n, b.min), b.max) : Math.max(0, n);
    set({ proWeightMax: val });
  },
  setProDistortionMaxPct: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const dmax = caps?.distortionMaxMax ?? 100;
    const val = Math.min(Math.max(n, 0), dmax);
    set({ proDistortionMaxPct: val });
  },
  setProBreathingMinScore: (n) => {
    get().pushHistory();
    const caps = get().availabilityCaps;
    const bmin = caps?.breathingMinMin ?? 0;
    const val = Math.min(Math.max(n, bmin), 10);
    set({ proBreathingMinScore: val });
  },
  setSoftPrice: (v) => { get().pushHistory(); set({ softPrice: v }); },
  setSoftWeight: (v) => { get().pushHistory(); set({ softWeight: v }); },
  setSoftDistortion: (v) => { get().pushHistory(); set({ softDistortion: v }); },
  setSoftBreathing: (v) => { get().pushHistory(); set({ softBreathing: v }); },
  setEnablePrice: (v: boolean) => { get().pushHistory(); set({ enablePrice: v }); },
  setEnableWeight: (v: boolean) => { get().pushHistory(); set({ enableWeight: v }); },
  setEnableDistortion: (v: boolean) => { get().pushHistory(); set({ enableDistortion: v }); },
  setEnableBreathing: (v: boolean) => { get().pushHistory(); set({ enableBreathing: v }); },

  setGoalPreset: (p) => { get().pushHistory(); set({ goalPreset: p, goalWeights: { ...PRESETS[p] } }); },
  setGoalWeights: (w) => { get().pushHistory(); set({ goalWeights: { ...w } }); },

  setAvailabilityCaps: (caps) => set({ availabilityCaps: caps }),
  setBoundsFromAvailability: (a) => {
    // Replace with a minimal, non-snapping update: set availability caps, do not
    // modify user selections (no auto-expand/clamp behavior).
    const currentCaps = get().availabilityCaps;
    if (!currentCaps || !availabilityCapsEqual(currentCaps, a)) {
      set({ availabilityCaps: a });
    }
  },

  resetFilters: (availability) => {
    const defaults = {
      cameraName: 'Any',
      brand: 'Any',
      lensType: 'Any',
      sealed: false,
      isMacro: false,
      priceRange: availability ? { ...availability.priceBounds } : { min: 0, max: 5000 },
      weightRange: availability ? { ...availability.weightBounds } : { min: 0, max: 2000 },
      proCoverage: 'Any',
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: false,
      proRequireSealed: false,
      proRequireMacro: false,
      proPriceMax: availability ? availability.priceBounds.max : 5000,
      proWeightMax: availability ? availability.weightBounds.max : 2000,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
    };
    set(defaults);
  },

  resetAll: () => {
    // Single set to avoid intermediate URL writes
    const defaults = {
      stage: 0,
      cameraName: 'Any',
      isPro: true,
      brand: 'Any',
      lensType: 'Any',
      sealed: false,
      isMacro: false,
      priceRange: { min: 0, max: 1_000_000 },
      weightRange: { min: 0, max: 100_000 },
      proCoverage: 'Any',
      proFocalMin: 0,
      proFocalMax: 9999,
      proMaxApertureF: 99,
      proRequireOIS: false,
      proRequireSealed: false,
      proRequireMacro: false,
      proPriceMax: 1_000_000,
      proWeightMax: 100_000,
      proDistortionMaxPct: 100,
      proBreathingMinScore: 0,
      softPrice: false,
      softWeight: false,
      softDistortion: false,
      softBreathing: false,
      enablePrice: true,
      enableWeight: true,
      enableDistortion: true,
      enableBreathing: true,
      goalPreset: 'Balanced',
      goalWeights: { ...PRESETS['Balanced'] },
      focalChoice: 50,
      subjectDistanceM: 3.0,
      selected: null,
      compareList: [],
    } as const;
    set(defaults as unknown as Partial<FilterState>);
  },

  // Capture a snapshot as a stage baseline and optionally reset first
  captureStageBaseline: (stageNum, opts) => {
    // Optionally reset before capturing
    if (opts && opts.resetOnEntry) {
      const caps = get().availabilityCaps;
      if (caps) {
        get().resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
      } else {
        get().resetFilters();
      }
    }
    const s = get();
    const baseline = {
      cameraName: s.cameraName,
      isPro: s.isPro,
      brand: s.brand,
      lensType: s.lensType,
      sealed: s.sealed,
      isMacro: s.isMacro,
      priceRange: { ...s.priceRange },
      weightRange: { ...s.weightRange },
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
      goalPreset: s.goalPreset,
      goalWeights: { ...s.goalWeights },
      focalChoice: s.focalChoice,
      subjectDistanceM: s.subjectDistanceM,
    };
    const key = `__baseline_${stageNum}__` as unknown as keyof FilterState;
    set({ [key]: baseline } as unknown as Partial<FilterState>);
  },

  // Reset current (or specified) stage back to its captured baseline
  resetToStageBaseline: (stageNum) => {
    const currentStage = typeof stageNum === 'number' ? stageNum : get().stage;
    const key = `__baseline_${currentStage}__` as unknown as keyof FilterState;
    const anyState = get() as unknown as Record<string, any>;
    const baseline = anyState[key];
    if (!baseline) {
      const caps = get().availabilityCaps;
      if (caps) {
        get().resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
      } else {
        get().resetFilters();
      }
      return;
    }
    set({
      cameraName: baseline.cameraName,
      isPro: baseline.isPro,
      brand: baseline.brand,
      lensType: baseline.lensType,
      sealed: baseline.sealed,
      isMacro: baseline.isMacro,
      priceRange: { ...baseline.priceRange },
      weightRange: { ...baseline.weightRange },
      proCoverage: baseline.proCoverage,
      proFocalMin: baseline.proFocalMin,
      proFocalMax: baseline.proFocalMax,
      proMaxApertureF: baseline.proMaxApertureF,
      proRequireOIS: baseline.proRequireOIS,
      proRequireSealed: baseline.proRequireSealed,
      proRequireMacro: baseline.proRequireMacro,
      proPriceMax: baseline.proPriceMax,
      proWeightMax: baseline.proWeightMax,
      proDistortionMaxPct: baseline.proDistortionMaxPct,
      proBreathingMinScore: baseline.proBreathingMinScore,
      softPrice: baseline.softPrice,
      softWeight: baseline.softWeight,
      softDistortion: baseline.softDistortion,
      softBreathing: baseline.softBreathing,
      enablePrice: baseline.enablePrice,
      enableWeight: baseline.enableWeight,
      enableDistortion: baseline.enableDistortion,
      enableBreathing: baseline.enableBreathing,
      goalPreset: baseline.goalPreset,
      goalWeights: { ...baseline.goalWeights },
      focalChoice: baseline.focalChoice,
      subjectDistanceM: baseline.subjectDistanceM,
    } as unknown as Partial<FilterState>);
  },

  // History (simple stack of snapshots) and counters for UI enable/disable
  historyLength: 0,
  redoLength: 0,
  pushHistory: () => {
    const s = get();
    const snapshot = {
      stage: s.stage,
      cameraName: s.cameraName,
      brand: s.brand,
      lensType: s.lensType,
      sealed: s.sealed,
      isMacro: s.isMacro,
      priceRange: { ...s.priceRange },
      weightRange: { ...s.weightRange },
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
    };
    // Keep on a hidden key inside state to avoid extra interface surface
    const histKey = '__history__' as unknown as keyof FilterState;
    const redoKey = '__redo__' as unknown as keyof FilterState;
    const currentAny = get() as unknown as Record<string, any>;
    const hist: any[] = Array.isArray(currentAny[histKey]) ? currentAny[histKey] : [];
    const last = hist[hist.length - 1];
    const nextHist = last && JSON.stringify(last) === JSON.stringify(snapshot) ? hist : [...hist, snapshot].slice(-100);
    // clear redo when new history entry is pushed
    set({ [histKey]: nextHist, [redoKey]: [], historyLength: nextHist.length, redoLength: 0 } as unknown as Partial<FilterState>);
  },
  undoLastFilter: () => {
    const histKey = '__history__' as unknown as keyof FilterState;
    const redoKey = '__redo__' as unknown as keyof FilterState;
    const currentAny = get() as unknown as Record<string, any>;
    const hist: any[] = Array.isArray(currentAny[histKey]) ? currentAny[histKey] : [];
    if (hist.length === 0) return;
    const next = hist.slice(0, -1);
    const prev = hist[hist.length - 1];
    const cur = {
      stage: currentAny.stage,
      cameraName: currentAny.cameraName,
      brand: currentAny.brand,
      lensType: currentAny.lensType,
      sealed: currentAny.sealed,
      isMacro: currentAny.isMacro,
      priceRange: { ...currentAny.priceRange },
      weightRange: { ...currentAny.weightRange },
      proCoverage: currentAny.proCoverage,
      proFocalMin: currentAny.proFocalMin,
      proFocalMax: currentAny.proFocalMax,
      proMaxApertureF: currentAny.proMaxApertureF,
      proRequireOIS: currentAny.proRequireOIS,
      proRequireSealed: currentAny.proRequireSealed,
      proRequireMacro: currentAny.proRequireMacro,
      proPriceMax: currentAny.proPriceMax,
      proWeightMax: currentAny.proWeightMax,
      proDistortionMaxPct: currentAny.proDistortionMaxPct,
      proBreathingMinScore: currentAny.proBreathingMinScore,
      softPrice: currentAny.softPrice,
      softWeight: currentAny.softWeight,
      softDistortion: currentAny.softDistortion,
      softBreathing: currentAny.softBreathing,
    };
    const redo: any[] = Array.isArray(currentAny[redoKey]) ? currentAny[redoKey] : [];
    set({
      stage: prev.stage,
      cameraName: prev.cameraName,
      brand: prev.brand,
      lensType: prev.lensType,
      sealed: prev.sealed,
      isMacro: prev.isMacro,
      priceRange: { ...prev.priceRange },
      weightRange: { ...prev.weightRange },
      proCoverage: prev.proCoverage,
      proFocalMin: prev.proFocalMin,
      proFocalMax: prev.proFocalMax,
      proMaxApertureF: prev.proMaxApertureF,
      proRequireOIS: prev.proRequireOIS,
      proRequireSealed: prev.proRequireSealed,
      proRequireMacro: prev.proRequireMacro,
      proPriceMax: prev.proPriceMax,
      proWeightMax: prev.proWeightMax,
      proDistortionMaxPct: prev.proDistortionMaxPct,
      proBreathingMinScore: prev.proBreathingMinScore,
      softPrice: prev.softPrice,
      softWeight: prev.softWeight,
      softDistortion: prev.softDistortion,
      softBreathing: prev.softBreathing,
      [histKey]: next,
      [redoKey]: [...redo, cur].slice(-100),
      historyLength: next.length,
      redoLength: (redo.length + 1),
    } as unknown as Partial<FilterState>);
  },
  redoLastFilter: () => {
    const histKey = '__history__' as unknown as keyof FilterState;
    const redoKey = '__redo__' as unknown as keyof FilterState;
    const currentAny = get() as unknown as Record<string, any>;
    const hist: any[] = Array.isArray(currentAny[histKey]) ? currentAny[histKey] : [];
    const redo: any[] = Array.isArray(currentAny[redoKey]) ? currentAny[redoKey] : [];
    if (redo.length === 0) return;
    const nextState = redo[redo.length - 1];
    const remainingRedo = redo.slice(0, -1);
    const cur = {
      stage: currentAny.stage,
      cameraName: currentAny.cameraName,
      brand: currentAny.brand,
      lensType: currentAny.lensType,
      sealed: currentAny.sealed,
      isMacro: currentAny.isMacro,
      priceRange: { ...currentAny.priceRange },
      weightRange: { ...currentAny.weightRange },
      proCoverage: currentAny.proCoverage,
      proFocalMin: currentAny.proFocalMin,
      proFocalMax: currentAny.proFocalMax,
      proMaxApertureF: currentAny.proMaxApertureF,
      proRequireOIS: currentAny.proRequireOIS,
      proRequireSealed: currentAny.proRequireSealed,
      proRequireMacro: currentAny.proRequireMacro,
      proPriceMax: currentAny.proPriceMax,
      proWeightMax: currentAny.proWeightMax,
      proDistortionMaxPct: currentAny.proDistortionMaxPct,
      proBreathingMinScore: currentAny.proBreathingMinScore,
      softPrice: currentAny.softPrice,
      softWeight: currentAny.softWeight,
      softDistortion: currentAny.softDistortion,
      softBreathing: currentAny.softBreathing,
    };
    set({
      stage: nextState.stage,
      cameraName: nextState.cameraName,
      brand: nextState.brand,
      lensType: nextState.lensType,
      sealed: nextState.sealed,
      isMacro: nextState.isMacro,
      priceRange: { ...nextState.priceRange },
      weightRange: { ...nextState.weightRange },
      proCoverage: nextState.proCoverage,
      proFocalMin: nextState.proFocalMin,
      proFocalMax: nextState.proFocalMax,
      proMaxApertureF: nextState.proMaxApertureF,
      proRequireOIS: nextState.proRequireOIS,
      proRequireSealed: nextState.proRequireSealed,
      proRequireMacro: nextState.proRequireMacro,
      proPriceMax: nextState.proPriceMax,
      proWeightMax: nextState.proWeightMax,
      proDistortionMaxPct: nextState.proDistortionMaxPct,
      proBreathingMinScore: nextState.proBreathingMinScore,
      softPrice: nextState.softPrice,
      softWeight: nextState.softWeight,
      softDistortion: nextState.softDistortion,
      softBreathing: nextState.softBreathing,
      [histKey]: [...hist, cur].slice(-100),
      [redoKey]: remainingRedo,
      historyLength: (hist.length + 1),
      redoLength: remainingRedo.length,
    } as unknown as Partial<FilterState>);
  },
  report: null,
  setReport: (r) => set({ report: r }),
  selected: null,
  setSelected: (r) => set({ selected: r }),
  compareList: [],
  setCompareList: (ids) => set({ compareList: [...ids] }),
  toggleCompare: (id) => {
    const current = get().compareList;
    const exists = current.includes(id);
    const next = exists ? current.filter(n => n !== id) : [...current, id];
    set({ compareList: next });
  },
  clearCompare: () => set({ compareList: [] }),
  priceOverrides: {},
  setPriceOverrides: (overrides) => set({ priceOverrides: { ...overrides } }),
}), {
  name: 'camera-filter-storage',
  version: 2,
  migrate: (persisted: any) => {
    if (persisted && typeof persisted === 'object') {
      if ('stage' in persisted) delete persisted.stage;
      // Do not persist compare selections across sessions
      if ('compareList' in persisted) delete persisted.compareList;
      if ('selected' in persisted) delete persisted.selected;
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


