import type { FilterState } from '../../filterStore';
import { PRESETS } from '../../../lib/recommender';

export function createResetsSlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    resetFilters: (availability?: { priceBounds: { min: number; max: number }; weightBounds: { min: number; max: number } }) => {
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
      } as const;
      set(defaults as unknown as Partial<FilterState>);
    },
    resetAll: () => {
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
  } satisfies Partial<FilterState>;
}


