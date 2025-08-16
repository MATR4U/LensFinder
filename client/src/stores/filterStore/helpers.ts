import type { FilterState } from '../filterStore';

export type Range = { min: number; max: number };

export function scheduleDebouncedRangeUpdate(
  stateKey: keyof FilterState,
  range: Range,
  timerKey: keyof FilterState,
  get: () => FilterState,
  set: (partial: Partial<FilterState>) => void,
  boundsOrGetter?: Range | (() => Range | undefined)
) {
  const anyState = get() as unknown as Record<string, any>;
  const existing = anyState[timerKey as unknown as string];
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    const min = Math.min(range.min, range.max);
    const max = Math.max(range.min, range.max);
    const bounds = typeof boundsOrGetter === 'function' ? boundsOrGetter() : boundsOrGetter;
    const clamped = bounds ? { min: Math.max(bounds.min, min), max: Math.min(bounds.max, max) } : { min, max };
    get().pushHistory();
    set({ [stateKey]: clamped } as unknown as Partial<FilterState>);
    set({ [timerKey]: undefined } as unknown as Partial<FilterState>);
  }, 200);
  set({ [timerKey]: t } as unknown as Partial<FilterState>);
}

export function buildBaselineSnapshot(s: FilterState) {
  return {
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
  } as const;
}

export function buildHistorySnapshot(s: FilterState) {
  return {
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
  } as const;
}

// Coalesce multiple field updates into a single history entry
export function withHistory(
  get: () => FilterState,
  set: (partial: Partial<FilterState>) => void,
  updater: () => void
) {
  const before = buildHistorySnapshot(get());
  updater();
  const after = buildHistorySnapshot(get());
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    get().pushHistory();
  }
}

// Centralized coalesced history push used by pro filter setters
export function scheduleHistoryCoalescedPush(get: () => FilterState, set: (partial: Partial<FilterState>) => void, delayMs = 300) {
  const anyState = get() as unknown as Record<string, any>;
  const timerKey = '__historyTimer__' as unknown as keyof FilterState;
  const existing = anyState[timerKey as unknown as string];
  if (existing) clearTimeout(existing);
  const t = setTimeout(() => {
    get().pushHistory();
    set({ [timerKey]: undefined } as unknown as Partial<FilterState>);
  }, delayMs);
  set({ [timerKey]: t } as unknown as Partial<FilterState>);
}


