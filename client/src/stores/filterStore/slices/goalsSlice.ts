import type { FilterState } from '../../filterStore';
import { PRESETS } from '../../../lib/recommender';
import { mapWeightsToLegacyFilters } from '../../../lib/presetsMapping';

export function createGoalsSlice(
  set: (partial: Partial<FilterState>) => void,
  get: () => FilterState
) {
  return {
    goalPreset: 'Balanced',
    goalWeights: { ...PRESETS['Balanced'] },
    focalChoice: 50,
    subjectDistanceM: 3.0,
    setFocalChoice: (n: number) => set({ focalChoice: n }),
    setSubjectDistanceM: (n: number) => set({ subjectDistanceM: n }),

    setGoalPreset: (p: string) => {
      get().pushHistory();
      const weights = PRESETS[p] || {};
      const cur = get();
      const delta = mapWeightsToLegacyFilters(weights, cur, cur.availabilityCaps);

      // Preset-specific overrides applied on top of mapped delta
      let override: Partial<FilterState> = {};
      switch (p) {
        case 'Sports':
          override = {
            proRequireOIS: true,
            proFocalMin: Math.max(70, (delta.proFocalMin ?? cur.proFocalMin)),
            proFocalMax: Math.max((delta.proFocalMax ?? cur.proFocalMax), 200),
          };
          break;
        case 'Portrait':
          override = { proMaxApertureF: Math.min((delta.proMaxApertureF ?? cur.proMaxApertureF), 2.0) };
          break;
        case 'Landscape':
          override = {
            enableDistortion: true,
            softDistortion: false,
            proDistortionMaxPct: Math.min((delta.proDistortionMaxPct ?? cur.proDistortionMaxPct), 2.0),
          };
          break;
        case 'Architecture':
          override = {
            enableDistortion: true,
            softDistortion: false,
            proDistortionMaxPct: Math.min((delta.proDistortionMaxPct ?? cur.proDistortionMaxPct), 1.5),
          };
          break;
        case 'Travel':
          override = {
            enableWeight: true,
            softWeight: false,
            proWeightMax: Math.min((delta.proWeightMax ?? cur.proWeightMax), 900),
            enablePrice: true,
            softPrice: true,
            proPriceMax: Math.min((delta.proPriceMax ?? cur.proPriceMax), 2000),
          };
          break;
        case 'Street':
          override = {
            enableWeight: true,
            softWeight: false,
            proWeightMax: Math.min((delta.proWeightMax ?? cur.proWeightMax), 700),
            proMaxApertureF: Math.min((delta.proMaxApertureF ?? cur.proMaxApertureF), 2.8),
          };
          break;
        case 'Video/Vlog':
          override = {
            enableBreathing: true,
            softBreathing: false,
            proBreathingMinScore: Math.max((delta.proBreathingMinScore ?? cur.proBreathingMinScore), 7),
            proRequireOIS: true,
          };
          break;
        case 'Astrophotography':
          override = { proMaxApertureF: Math.min((delta.proMaxApertureF ?? cur.proMaxApertureF), 2.0) };
          break;
        default:
          override = {};
      }

      set({ goalPreset: p, goalWeights: { ...weights }, ...delta, ...override });
    },
    setGoalWeights: (w: Record<string, number>) => {
      get().pushHistory();
      const weights = { ...(w || {}) } as Record<string, number>;
      const delta = mapWeightsToLegacyFilters(weights, get(), get().availabilityCaps);
      set({ goalPreset: 'Custom', goalWeights: { ...weights }, ...delta });
    },
  } satisfies Partial<FilterState>;
}


