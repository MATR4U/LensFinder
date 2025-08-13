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
  softDistortion: boolean;
  softBreathing: boolean;

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
  setSoftDistortion: (v: boolean) => void;
  setSoftBreathing: (v: boolean) => void;

  setGoalPreset: (p: string) => void;
  setGoalWeights: (w: Record<string, number>) => void;

  setAvailabilityCaps: (caps: FilterState['availabilityCaps']) => void;
  setBoundsFromAvailability: (a: NonNullable<FilterState['availabilityCaps']>) => void;

  resetFilters: (availability?: {
    priceBounds: Range;
    weightBounds: Range;
  }) => void;

  // History
  pushHistory: () => void;
  undoLastFilter: () => void;
  redoLastFilter: () => void;

  // Report state
  report: ReportResponse | null;
  setReport: (r: ReportResponse | null) => void;

  // Cross-step UI state
  selected: Result | null;
  setSelected: (r: Result | null) => void;
  compareList: string[];
  setCompareList: (names: string[]) => void;
  toggleCompare: (name: string) => void;
  clearCompare: () => void;

  // Pricing overrides (UI/data aid)
  priceOverrides: Record<string, string>;
  setPriceOverrides: (overrides: Record<string, string>) => void;
}

export const useFilterStore = createWithEqualityFn<FilterState>()(persist((set, get) => ({
  // Journey
  stage: 0,
  setStage: (n) => set({ stage: n }),
  continueTo: (n) => set({ stage: n }),
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
  softDistortion: false,
  softBreathing: false,

  goalPreset: 'Balanced',
  goalWeights: { ...PRESETS['Balanced'] },

  focalChoice: 50,
  subjectDistanceM: 3.0,
  setFocalChoice: (n) => set({ focalChoice: n }),
  setSubjectDistanceM: (n) => set({ subjectDistanceM: n }),

   availabilityCaps: undefined,

  // Actions
  setIsPro: (v) => set({ isPro: v }),
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
  setSoftDistortion: (v) => { get().pushHistory(); set({ softDistortion: v }); },
  setSoftBreathing: (v) => { get().pushHistory(); set({ softBreathing: v }); },

  setGoalPreset: (p) => { get().pushHistory(); set({ goalPreset: p, goalWeights: { ...PRESETS[p] } }); },
  setGoalWeights: (w) => { get().pushHistory(); set({ goalWeights: { ...w } }); },

  setAvailabilityCaps: (caps) => set({ availabilityCaps: caps }),
  setBoundsFromAvailability: (a) => {
    const updates: Partial<FilterState> = {};

    // Update caps only if changed to avoid redundant updates
    const currentCaps = get().availabilityCaps;
    if (!currentCaps || !availabilityCapsEqual(currentCaps, a)) {
      updates.availabilityCaps = a;
    }

    // Read current state
    const s = get();
    // Hidden keys for last-known bounds/caps to detect user overrides
    const lastPBKey = '__lastPriceBounds__' as unknown as keyof FilterState;
    const lastWBKey = '__lastWeightBounds__' as unknown as keyof FilterState;
    const lastFBKey = '__lastFocalBounds__' as unknown as keyof FilterState;
    const lastCapsKey = '__lastCaps__' as unknown as keyof FilterState;
    const anyState = get() as unknown as Record<string, any>;
    const lastPB = anyState[lastPBKey] as Range | undefined;
    const lastWB = anyState[lastWBKey] as Range | undefined;
    const lastFB = anyState[lastFBKey] as Range | undefined;
    const lastCaps = anyState[lastCapsKey] as { apMax: number; distMax: number; breathMin: number } | undefined;

    // Brand/lensType/coverage coercion
    if (!a.brands.includes(s.brand)) updates.brand = 'Any';
    if (!a.lensTypes.includes(s.lensType)) updates.lensType = 'Any';
    if (!a.coverage.includes(s.proCoverage)) updates.proCoverage = 'Any';

    // Price range auto-expand if user hasn't overridden (still equal to last bounds)
    const pr = s.priceRange;
    const pb = a.priceBounds;
    const prMatchesLast = lastPB && pr.min === lastPB.min && pr.max === lastPB.max;
    if (!lastPB || prMatchesLast) {
      if (pr.min !== pb.min || pr.max !== pb.max) updates.priceRange = { ...pb };
    } else if (pr.min < pb.min || pr.max > pb.max || pr.min > pr.max) {
      updates.priceRange = { min: Math.min(Math.max(pr.min, pb.min), pb.max), max: Math.max(Math.min(pr.max, pb.max), pb.min) };
    }

    // Weight range
    const wr = s.weightRange;
    const wb = a.weightBounds;
    const wrMatchesLast = lastWB && wr.min === lastWB.min && wr.max === lastWB.max;
    if (!lastWB || wrMatchesLast) {
      if (wr.min !== wb.min || wr.max !== wb.max) updates.weightRange = { ...wb };
    } else if (wr.min < wb.min || wr.max > wb.max || wr.min > wr.max) {
      updates.weightRange = { min: Math.min(Math.max(wr.min, wb.min), wb.max), max: Math.max(Math.min(wr.max, wb.max), wb.min) };
    }

    // Focal bounds and pro focal min/max
    const fb = a.focalBounds;
    const userUntouchedFocal = (!lastFB && s.proFocalMin === 0 && s.proFocalMax === 9999) || (lastFB && s.proFocalMin === lastFB.min && s.proFocalMax === lastFB.max);
    if (userUntouchedFocal) {
      // Do NOT auto-apply focal bounds to avoid activating the focal-range filter implicitly.
      // Leave defaults (0, 9999). Only clamp if current values are out-of-order/pathological.
      const needsClamp = s.proFocalMin > s.proFocalMax;
      if (needsClamp) {
        updates.proFocalMin = Math.min(fb.min, fb.max);
        updates.proFocalMax = Math.max(fb.min, fb.max);
      }
    } else {
      const newMin = Math.min(Math.max(s.proFocalMin, fb.min), fb.max);
      const newMax = Math.min(Math.max(s.proFocalMax, fb.min), fb.max);
      const nextMin = Math.min(newMin, newMax);
      const nextMax = Math.max(newMin, newMax);
      if (nextMin !== s.proFocalMin) updates.proFocalMin = nextMin;
      if (nextMax !== s.proFocalMax) updates.proFocalMax = nextMax;
    }

    // Caps: aperture/distortion/breathing
    const apMax = a.apertureMaxMax;
    const distMax = a.distortionMaxMax;
    const breathMin = a.breathingMinMin;
    const userUntouchedCaps = (!lastCaps && s.proMaxApertureF === 99 && s.proDistortionMaxPct === 100 && s.proBreathingMinScore === 0)
      || (lastCaps && s.proMaxApertureF === lastCaps.apMax && s.proDistortionMaxPct === lastCaps.distMax && s.proBreathingMinScore === lastCaps.breathMin);
    if (userUntouchedCaps) {
      if (s.proMaxApertureF !== apMax) updates.proMaxApertureF = apMax;
      if (s.proDistortionMaxPct !== distMax) updates.proDistortionMaxPct = distMax;
      if (s.proBreathingMinScore !== breathMin) updates.proBreathingMinScore = breathMin;
    } else {
      const nextAp = Math.min(Math.max(s.proMaxApertureF, 0.7), apMax);
      const nextDist = Math.min(Math.max(s.proDistortionMaxPct, 0), distMax);
      const nextBreath = Math.min(Math.max(s.proBreathingMinScore, breathMin), 10);
      if (nextAp !== s.proMaxApertureF) updates.proMaxApertureF = nextAp;
      if (nextDist !== s.proDistortionMaxPct) updates.proDistortionMaxPct = nextDist;
      if (nextBreath !== s.proBreathingMinScore) updates.proBreathingMinScore = nextBreath;
    }

    // Pro caps: price/weight max
    const userUntouchedPriceCap = (!lastPB && s.proPriceMax === 5000) || (lastPB && s.proPriceMax === lastPB.max);
    if (userUntouchedPriceCap) {
      if (s.proPriceMax !== pb.max) updates.proPriceMax = pb.max;
    } else {
      const nextP = Math.min(Math.max(s.proPriceMax, pb.min), pb.max);
      if (nextP !== s.proPriceMax) updates.proPriceMax = nextP;
    }

    const userUntouchedWeightCap = (!lastWB && s.proWeightMax === 2000) || (lastWB && s.proWeightMax === lastWB.max);
    if (userUntouchedWeightCap) {
      if (s.proWeightMax !== wb.max) updates.proWeightMax = wb.max;
    } else {
      const nextW = Math.min(Math.max(s.proWeightMax, wb.min), wb.max);
      if (nextW !== s.proWeightMax) updates.proWeightMax = nextW;
    }

    // Store last bounds/caps
    if (!lastPB || !rangesEqual(lastPB, pb)) (updates as any)[lastPBKey] = { ...pb };
    if (!lastWB || !rangesEqual(lastWB, wb)) (updates as any)[lastWBKey] = { ...wb };
    if (!lastFB || !rangesEqual(lastFB, fb)) (updates as any)[lastFBKey] = { ...fb };
    const nextCapsSnapshot = { apMax, distMax, breathMin };
    if (!lastCaps || lastCaps.apMax !== apMax || lastCaps.distMax !== distMax || lastCaps.breathMin !== breathMin) (updates as any)[lastCapsKey] = nextCapsSnapshot;

    if (Object.keys(updates).length > 0) set(updates);
  },

  resetFilters: (availability) => {
    const defaults = {
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

  // History (simple stack of snapshots)
  pushHistory: () => {
    const s = get();
    const snapshot = {
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
    set({ [histKey]: nextHist, [redoKey]: [] } as unknown as Partial<FilterState>);
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
      softDistortion: currentAny.softDistortion,
      softBreathing: currentAny.softBreathing,
    };
    const redo: any[] = Array.isArray(currentAny[redoKey]) ? currentAny[redoKey] : [];
    set({
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
      softDistortion: prev.softDistortion,
      softBreathing: prev.softBreathing,
      [histKey]: next,
      [redoKey]: [...redo, cur].slice(-100),
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
      softDistortion: currentAny.softDistortion,
      softBreathing: currentAny.softBreathing,
    };
    set({
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
      softDistortion: nextState.softDistortion,
      softBreathing: nextState.softBreathing,
      [histKey]: [...hist, cur].slice(-100),
      [redoKey]: remainingRedo,
    } as unknown as Partial<FilterState>);
  },
  report: null,
  setReport: (r) => set({ report: r }),
  selected: null,
  setSelected: (r) => set({ selected: r }),
  compareList: [],
  setCompareList: (names) => set({ compareList: [...names] }),
  toggleCompare: (name) => {
    const current = get().compareList;
    const exists = current.includes(name);
    const next = exists ? current.filter(n => n !== name) : [...current, name];
    set({ compareList: next });
  },
  clearCompare: () => set({ compareList: [] }),
  priceOverrides: {},
  setPriceOverrides: (overrides) => set({ priceOverrides: { ...overrides } }),
}), {
  name: 'camera-filter-storage',
  partialize: (state) => ({
    stage: state.stage,
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
    selected: state.selected,
    compareList: state.compareList,
    // Do not persist availability caps, history, or report
  }),
}));

// URL sync subscription (store-level): hydrate on load and write on state changes
if (typeof window !== 'undefined') {
  // Hydrate from URL once
  const params = new URLSearchParams(window.location.search);
  const s = useFilterStore.getState();
  const getNum = (k: string, def: number) => {
    const v = params.get(k); const n = v ? Number(v) : NaN; return Number.isFinite(n) ? n : def;
  };
  const cameraName = params.get('cameraName'); if (cameraName) s.setCameraName(cameraName);
  const isPro = params.get('isPro'); if (isPro !== null) s.setIsPro(isPro === '1' || isPro === 'true');
  const brand = params.get('brand'); if (brand) s.setBrand(brand);
  const lensType = params.get('lensType'); if (lensType) s.setLensType(lensType);
  const sealed = params.get('sealed'); if (sealed !== null) s.setSealed(sealed === '1' || sealed === 'true');
  const isMacro = params.get('isMacro'); if (isMacro !== null) s.setIsMacro(isMacro === '1' || isMacro === 'true');
  const pmin = getNum('pmin', s.priceRange.min);
  const pmax = getNum('pmax', s.priceRange.max);
  s.setPriceRange({ min: pmin, max: pmax });
  const wmin = getNum('wmin', s.weightRange.min);
  const wmax = getNum('wmax', s.weightRange.max);
  s.setWeightRange({ min: wmin, max: wmax });
  const gp = params.get('goal'); if (gp) s.setGoalPreset(gp);

  // Subscribe to changes and update URL
  let prev = useFilterStore.getState();
  useFilterStore.subscribe((next) => {
    const changed = (
      prev.cameraName !== next.cameraName || prev.isPro !== next.isPro ||
      prev.brand !== next.brand || prev.lensType !== next.lensType ||
      prev.sealed !== next.sealed || prev.isMacro !== next.isMacro ||
      prev.priceRange.min !== next.priceRange.min || prev.priceRange.max !== next.priceRange.max ||
      prev.weightRange.min !== next.weightRange.min || prev.weightRange.max !== next.weightRange.max ||
      prev.goalPreset !== next.goalPreset
    );
    if (changed) {
      const p = new URLSearchParams(window.location.search);
      p.set('cameraName', next.cameraName);
      p.set('isPro', next.isPro ? '1' : '0');
      p.set('brand', next.brand);
      p.set('lensType', next.lensType);
      p.set('sealed', next.sealed ? '1' : '0');
      p.set('isMacro', next.isMacro ? '1' : '0');
      p.set('pmin', String(next.priceRange.min));
      p.set('pmax', String(next.priceRange.max));
      p.set('wmin', String(next.weightRange.min));
      p.set('wmax', String(next.weightRange.max));
      p.set('goal', next.goalPreset);
      const nextUrl = `${window.location.pathname}?${p.toString()}`;
      window.history.replaceState(null, '', nextUrl);
    }
    prev = next;
  });
}


