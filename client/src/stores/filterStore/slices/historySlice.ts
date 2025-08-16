import type { FilterState } from '../../filterStore';
import { buildBaselineSnapshot, buildHistorySnapshot } from '../helpers';

export function createHistorySlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    historyLength: 0,
    redoLength: 0,
    pushHistory: () => {
      const s = get();
      const snapshot = buildHistorySnapshot(s);
      const histKey = '__history__' as unknown as keyof FilterState;
      const redoKey = '__redo__' as unknown as keyof FilterState;
      const currentAny = get() as unknown as Record<string, any>;
      const hist: any[] = Array.isArray(currentAny[histKey]) ? currentAny[histKey] : [];
      const last = hist[hist.length - 1];
      const nextHist = last && JSON.stringify(last) === JSON.stringify(snapshot) ? hist : [...hist, snapshot].slice(-100);
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
      const cur = buildHistorySnapshot(currentAny as unknown as FilterState);
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
      const cur = buildHistorySnapshot(currentAny as unknown as FilterState);
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
    captureStageBaseline: (stageNum: number, opts?: { resetOnEntry?: boolean }) => {
      if (opts && opts.resetOnEntry) {
        const caps = get().availabilityCaps;
        if (caps) {
          get().resetFilters({ priceBounds: caps.priceBounds, weightBounds: caps.weightBounds });
        } else {
          get().resetFilters();
        }
      }
      const s = get();
      const baseline = buildBaselineSnapshot(s);
      const key = `__baseline_${stageNum}__` as unknown as keyof FilterState;
      set({ [key]: baseline } as unknown as Partial<FilterState>);
    },
    resetToStageBaseline: (stageNum?: number) => {
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
      set(baseline as unknown as Partial<FilterState>);
    },
  } satisfies Partial<FilterState>;
}


