import { describe, it, expect } from 'vitest';
import { mapWeightsToLegacyFilters, inferPresetWithHysteresis } from '../src/lib/presetsMapping';
import { useFilterStore } from '../src/stores/filterStore';
import type { FilterState, Range } from '../src/stores/filterStore';

function makeCur(): FilterState {
  // Minimal subset needed by the mapper; other fields are unused in assertions
  return {
    // Journey
    stage: 0,
    setStage: () => {},
    continueTo: () => {},
    // Camera / mode
    cameraName: 'Any',
    setCameraName: () => {},
    isPro: true,
    setIsPro: () => {},
    // Simple
    brand: 'Any',
    setBrand: () => {},
    lensType: 'Any',
    setLensType: () => {},
    sealed: false,
    setSealed: () => {},
    isMacro: false,
    setIsMacro: () => {},
    priceRange: { min: 0, max: 1_000_000 },
    setPriceRange: () => {},
    weightRange: { min: 0, max: 100_000 },
    setWeightRange: () => {},
    // Pro filters (current values)
    proCoverage: 'Any',
    setProCoverage: () => {},
    proFocalMin: 0,
    setProFocalMin: () => {},
    proFocalMax: 9999,
    setProFocalMax: () => {},
    proMaxApertureF: 99,
    setProMaxApertureF: () => {},
    proRequireOIS: false,
    setProRequireOIS: () => {},
    proRequireSealed: false,
    setProRequireSealed: () => {},
    proRequireMacro: false,
    setProRequireMacro: () => {},
    proPriceMax: 1_000_000,
    setProPriceMax: () => {},
    proWeightMax: 100_000,
    setProWeightMax: () => {},
    proDistortionMaxPct: 100,
    setProDistortionMaxPct: () => {},
    proBreathingMinScore: 0,
    setProBreathingMinScore: () => {},
    // Soft/enables
    softPrice: false,
    setSoftPrice: () => {},
    softWeight: false,
    setSoftWeight: () => {},
    softDistortion: false,
    setSoftDistortion: () => {},
    softBreathing: false,
    setSoftBreathing: () => {},
    enablePrice: true,
    setEnablePrice: () => {},
    enableWeight: true,
    setEnableWeight: () => {},
    enableDistortion: true,
    setEnableDistortion: () => {},
    enableBreathing: true,
    setEnableBreathing: () => {},
    // Goals
    goalPreset: 'Balanced',
    goalWeights: {},
    setGoalPreset: () => {},
    setGoalWeights: () => {},
    // Globals
    focalChoice: 50,
    subjectDistanceM: 3,
    setFocalChoice: () => {},
    setSubjectDistanceM: () => {},
    // Caps
    availabilityCaps: undefined,
    setAvailabilityCaps: () => {},
    setBoundsFromAvailability: () => {},
    // Reset/history/report/ui stubs (unused here)
    resetFilters: () => {},
    resetAll: () => {},
    captureStageBaseline: () => {},
    resetToStageBaseline: () => {},
    pushHistory: () => {},
    undoLastFilter: () => {},
    redoLastFilter: () => {},
    historyLength: 0,
    redoLength: 0,
    report: null,
    setReport: () => {},
    selected: null,
    setSelected: () => {},
    compareList: [],
    setCompareList: () => {},
    toggleCompare: () => {},
    clearCompare: () => {},
    priceOverrides: {},
    setPriceOverrides: () => {},
  } as unknown as FilterState;
}

const caps = {
  priceBounds: { min: 249, max: 14_999 } as Range,
  weightBounds: { min: 135, max: 2_950 } as Range,
  focalBounds: { min: 8, max: 800 } as Range,
  apertureMaxMax: 5.6,
  distortionMaxMax: 6,
  breathingMinMin: 0,
};

describe('presets mapping → legacy filters', () => {
  it('portability increases should reduce weight cap monotonically', () => {
    const cur = makeCur();
    const low = mapWeightsToLegacyFilters({ portability: 0.2 }, cur, caps);
    const mid = mapWeightsToLegacyFilters({ portability: 0.6 }, cur, caps);
    const high = mapWeightsToLegacyFilters({ portability: 0.9 }, cur, caps);
    expect(low.enableWeight).toBe(false);
    expect(mid.enableWeight).toBe(true);
    expect(high.enableWeight).toBe(true);
    expect((mid.proWeightMax ?? Infinity) >= (high.proWeightMax ?? 0)).toBe(true);
  });

  it('value increases should reduce price cap monotonically', () => {
    const cur = makeCur();
    const low = mapWeightsToLegacyFilters({ value: 0.2 }, cur, caps);
    const mid = mapWeightsToLegacyFilters({ value: 0.6 }, cur, caps);
    const high = mapWeightsToLegacyFilters({ value: 0.9 }, cur, caps);
    expect(low.enablePrice).toBe(false);
    expect(mid.enablePrice).toBe(true);
    expect(high.enablePrice).toBe(true);
    expect((mid.proPriceMax ?? Infinity) >= (high.proPriceMax ?? 0)).toBe(true);
  });

  it('strong low_light/background_blur lowers max aperture and may require OIS', () => {
    const cur = makeCur();
    const baseline = mapWeightsToLegacyFilters({ low_light: 0.1, background_blur: 0.1 }, cur, caps);
    const high = mapWeightsToLegacyFilters({ low_light: 1.0, background_blur: 0.9 }, cur, caps);
    expect(high.proMaxApertureF!).toBeLessThanOrEqual(baseline.proMaxApertureF!);
    expect(high.proRequireOIS).toBe(true);
  });

  it('reach/wide strongly applied narrows focal range; balanced leaves unbounded', () => {
    const cur = makeCur();
    const balanced = mapWeightsToLegacyFilters({ reach: 0.5, wide: 0.5 }, cur, caps);
    expect(balanced.proFocalMin).toBe(0);
    expect(balanced.proFocalMax).toBe(9999);
    const tele = mapWeightsToLegacyFilters({ reach: 0.85 }, cur, caps);
    expect(tele.proFocalMin!).toBeGreaterThan(0);
    const wide = mapWeightsToLegacyFilters({ wide: 0.85 }, cur, caps);
    expect(wide.proFocalMax!).toBeLessThan(9999);
  });

  it('video excellence increases minimum breathing score and enables control', () => {
    const cur = makeCur();
    const low = mapWeightsToLegacyFilters({ video_excellence: 0.2 }, cur, caps);
    const high = mapWeightsToLegacyFilters({ video_excellence: 0.9 }, cur, caps);
    expect(low.enableBreathing).toBe(false);
    expect(high.enableBreathing).toBe(true);
    expect((high.proBreathingMinScore ?? 0) >= (low.proBreathingMinScore ?? 0)).toBe(true);
  });

  it('round-trip inference stays stable within hysteresis', () => {
    const presets = {
      A: { portability: 0.8, value: 0.3 },
      B: { portability: 0.3, value: 0.8 },
    };
    const cur = makeCur();
    // Start from A
    const delta = mapWeightsToLegacyFilters(presets.A, cur, caps);
    // Tiny nudge should keep A
    const smallWeights = { ...presets.A, portability: 0.78 };
    const inferred = inferPresetWithHysteresis('A', smallWeights, presets, 0.15, 0.05);
    expect(inferred).toBe('A');
  });

  it('grouped undo coalesces slider drags (history grows after idle)', async () => {
    const s = useFilterStore.getState();
    const before = s.historyLength;
    s.setProPriceMax(1200);
    s.setProPriceMax(1100);
    s.setProPriceMax(1000);
    expect(useFilterStore.getState().historyLength).toBe(before); // not yet pushed
    await new Promise(r => setTimeout(r, 350));
    expect(useFilterStore.getState().historyLength).toBe(before + 1);
  });
});


