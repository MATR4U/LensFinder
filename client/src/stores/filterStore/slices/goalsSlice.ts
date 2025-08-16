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
      const portability = weights.portability ?? 0;
      const valueW = weights.value ?? 0;
      const lowLightOrBlur = Math.max(weights.low_light ?? 0, weights.background_blur ?? 0);
      const distortion = weights.distortion_control ?? 0;
      const video = weights.video_excellence ?? 0;
      const reach = weights.reach ?? 0;
      const wide = weights.wide ?? 0;

      const cur = get();
      // TODO: Retain these for tuning heuristics; currently not applied directly
      const nextEnableWeight = cur.enableWeight; void nextEnableWeight;
      const nextSoftWeight = cur.softWeight; void nextSoftWeight;
      let nextWeightMax = cur.proWeightMax;
      if (portability >= 0.8) { nextEnableWeight = true; nextSoftWeight = false; nextWeightMax = 800; }
      else if (portability >= 0.6) { nextEnableWeight = true; nextSoftWeight = false; nextWeightMax = 1000; }
      else if (portability >= 0.4) { nextEnableWeight = true; nextSoftWeight = true; nextWeightMax = 1200; }
      else { nextEnableWeight = false; }

      const nextEnablePrice = cur.enablePrice; void nextEnablePrice;
      const nextSoftPrice = cur.softPrice; void nextSoftPrice;
      let nextPriceMax = cur.proPriceMax;
      if (valueW >= 0.8) { nextEnablePrice = true; nextSoftPrice = false; nextPriceMax = 1000; }
      else if (valueW >= 0.6) { nextEnablePrice = true; nextSoftPrice = false; nextPriceMax = 1500; }
      else if (valueW >= 0.4) { nextEnablePrice = true; nextSoftPrice = true; nextPriceMax = 2500; }
      else { nextEnablePrice = false; }

      let nextMaxApertureF = cur.proMaxApertureF;
      if (lowLightOrBlur >= 0.9) nextMaxApertureF = 2.0;
      else if (lowLightOrBlur >= 0.7) nextMaxApertureF = 2.8;
      else nextMaxApertureF = 99;

      let nextFocalMin = 0;
      let nextFocalMax = 9999;
      if (reach >= 0.9) nextFocalMin = 100;
      else if (reach >= 0.7) nextFocalMin = 70;
      else if (reach >= 0.5) nextFocalMin = 50;
      if (wide >= 0.9) nextFocalMax = 28;
      else if (wide >= 0.7) nextFocalMax = 35;
      else if (wide >= 0.5) nextFocalMax = 50;
      if (nextFocalMin > nextFocalMax) {
        const mid = Math.max(35, Math.min(85, nextFocalMin));
        nextFocalMin = mid - 10;
        nextFocalMax = mid + 10;
        if (nextFocalMin < 0) nextFocalMin = 0;
      }

      const nextEnableDistortion = cur.enableDistortion; void nextEnableDistortion;
      const nextSoftDistortion = cur.softDistortion; void nextSoftDistortion;
      let nextDistortionMax = cur.proDistortionMaxPct;
      if (distortion >= 0.7) { nextEnableDistortion = true; nextSoftDistortion = false; nextDistortionMax = 2.5; }
      else if (distortion >= 0.5) { nextEnableDistortion = true; nextSoftDistortion = true; nextDistortionMax = 3.5; }
      else { nextEnableDistortion = false; }

      const nextEnableBreathing = cur.enableBreathing; void nextEnableBreathing;
      const nextSoftBreathing = cur.softBreathing; void nextSoftBreathing;
      let nextBreathingMin = cur.proBreathingMinScore;
      if (video >= 0.7) { nextEnableBreathing = true; nextSoftBreathing = false; nextBreathingMin = 7; }
      else if (video >= 0.5) { nextEnableBreathing = true; nextSoftBreathing = true; nextBreathingMin = 5; }
      else { nextEnableBreathing = false; }

      const nextRequireOIS = cur.proRequireOIS; void nextRequireOIS;
      if (lowLightOrBlur >= 0.85) nextRequireOIS = true;

      let override: Partial<FilterState> = {};
      switch (p) {
        case 'Sports':
          override = { proRequireOIS: true, proFocalMin: Math.max(70, cur.proFocalMin), proFocalMax: Math.max(cur.proFocalMax, 200) };
          break;
        case 'Portrait':
          override = { proMaxApertureF: Math.min(nextMaxApertureF, 2.0) };
          break;
        case 'Landscape':
          override = { enableDistortion: true, softDistortion: false, proDistortionMaxPct: Math.min(nextDistortionMax, 2.0) };
          break;
        case 'Architecture':
          override = { enableDistortion: true, softDistortion: false, proDistortionMaxPct: Math.min(nextDistortionMax, 1.5) };
          break;
        case 'Travel':
          override = { enableWeight: true, softWeight: false, proWeightMax: Math.min(nextWeightMax, 900), enablePrice: true, softPrice: true, proPriceMax: Math.min(nextPriceMax, 2000) };
          break;
        case 'Street':
          override = { enableWeight: true, softWeight: false, proWeightMax: Math.min(nextWeightMax, 700), proMaxApertureF: Math.min(nextMaxApertureF, 2.8) };
          break;
        case 'Video/Vlog':
          override = { enableBreathing: true, softBreathing: false, proBreathingMinScore: Math.max(nextBreathingMin, 7), proRequireOIS: true };
          break;
        case 'Astrophotography':
          override = { proMaxApertureF: Math.min(nextMaxApertureF, 2.0) };
          break;
        default:
          override = {};
      }

      const delta = mapWeightsToLegacyFilters(weights, get(), get().availabilityCaps);
      set({
        goalPreset: p,
        goalWeights: { ...weights },
        ...delta,
        ...override,
      });
    },
    setGoalWeights: (w: Record<string, number>) => {
      get().pushHistory();
      const weights = { ...(w || {}) } as Record<string, number>;
      const delta = mapWeightsToLegacyFilters(weights, get(), get().availabilityCaps);
      set({ goalPreset: 'Custom', goalWeights: { ...weights }, ...delta });
    },
  } satisfies Partial<FilterState>;
}


