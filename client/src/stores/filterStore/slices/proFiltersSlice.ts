import type { FilterState } from '../../filterStore';
import { PRESETS } from '../../../lib/recommender';
import { inferPresetWithHysteresis, nudgeWeightsFromFilterDelta } from '../../../lib/presetsMapping';

export function createProFiltersSlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
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

    setProCoverage: (v: string) => {
      get().pushHistory();
      const caps = get().availabilityCaps;
      const next = caps && !caps.coverage.includes(v) ? 'Any' : v;
      set({ proCoverage: next });
    },
    setProFocalMin: (n: number) => {
      const caps = get().availabilityCaps;
      const fb = caps?.focalBounds;
      const max = get().proFocalMax;
      let val = n;
      if (fb) val = Math.min(Math.max(n, fb.min), fb.max);
      if (val > max) val = max;
      const nextWeights = nudgeWeightsFromFilterDelta({ proFocalMin: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proFocalMin: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setProFocalMax: (n: number) => {
      const caps = get().availabilityCaps;
      const fb = caps?.focalBounds;
      const min = get().proFocalMin;
      let val = n;
      if (fb) val = Math.min(Math.max(n, fb.min), fb.max);
      if (val < min) val = min;
      const nextWeights = nudgeWeightsFromFilterDelta({ proFocalMax: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proFocalMax: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setProMaxApertureF: (n: number) => {
      const caps = get().availabilityCaps;
      const apMax = caps?.apertureMaxMax ?? 99;
      const val = Math.min(Math.max(n, 0.7), apMax);
      const nextWeights = nudgeWeightsFromFilterDelta({ proMaxApertureF: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proMaxApertureF: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setProRequireOIS: (v: boolean) => { get().pushHistory(); set({ proRequireOIS: v }); },
    setProRequireSealed: (v: boolean) => { get().pushHistory(); set({ proRequireSealed: v }); },
    setProRequireMacro: (v: boolean) => { get().pushHistory(); set({ proRequireMacro: v }); },
    setProPriceMax: (n: number) => {
      const caps = get().availabilityCaps;
      const b = caps?.priceBounds;
      const val = b ? Math.min(Math.max(n, b.min), b.max) : Math.max(0, n);
      const nextWeights = nudgeWeightsFromFilterDelta({ proPriceMax: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proPriceMax: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setProWeightMax: (n: number) => {
      const caps = get().availabilityCaps;
      const b = caps?.weightBounds;
      const val = b ? Math.min(Math.max(n, b.min), b.max) : Math.max(0, n);
      const nextWeights = nudgeWeightsFromFilterDelta({ proWeightMax: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proWeightMax: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setProDistortionMaxPct: (n: number) => {
      const caps = get().availabilityCaps;
      const dmax = caps?.distortionMaxMax ?? 100;
      const val = Math.min(Math.max(n, 0), dmax);
      const nextWeights = nudgeWeightsFromFilterDelta({ proDistortionMaxPct: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proDistortionMaxPct: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setProBreathingMinScore: (n: number) => {
      const caps = get().availabilityCaps;
      const bmin = caps?.breathingMinMin ?? 0;
      const val = Math.min(Math.max(n, bmin), 10);
      const nextWeights = nudgeWeightsFromFilterDelta({ proBreathingMinScore: val }, caps, get().goalWeights);
      const inferred = inferPresetWithHysteresis(get().goalPreset, nextWeights, PRESETS, 0.15, 0.05);
      const anyState = get() as unknown as Record<string, any>;
      const timerKey = '__historyTimer__' as unknown as keyof FilterState;
      if (anyState[timerKey]) clearTimeout(anyState[timerKey]);
      const t = setTimeout(() => { get().pushHistory(); set({ [timerKey]: undefined } as unknown as Partial<FilterState>); }, 300);
      set({ [timerKey]: t } as unknown as Partial<FilterState>);
      set({ proBreathingMinScore: val, goalWeights: nextWeights, goalPreset: inferred });
    },
    setSoftPrice: (v: boolean) => { get().pushHistory(); set({ softPrice: v }); },
    setSoftWeight: (v: boolean) => { get().pushHistory(); set({ softWeight: v }); },
    setSoftDistortion: (v: boolean) => { get().pushHistory(); set({ softDistortion: v }); },
    setSoftBreathing: (v: boolean) => { get().pushHistory(); set({ softBreathing: v }); },
    setEnablePrice: (v: boolean) => { get().pushHistory(); set({ enablePrice: v }); },
    setEnableWeight: (v: boolean) => { get().pushHistory(); set({ enableWeight: v }); },
    setEnableDistortion: (v: boolean) => { get().pushHistory(); set({ enableDistortion: v }); },
    setEnableBreathing: (v: boolean) => { get().pushHistory(); set({ enableBreathing: v }); },
  } satisfies Partial<FilterState>;
}


