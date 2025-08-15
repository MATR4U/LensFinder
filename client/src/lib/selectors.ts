import type { Camera, Lens, Result } from '../types';
import { computeAvailability, type Availability } from './availability';
import { applyFilters } from './filters';
import { computeResults } from './recommender';

export const makeBrandsForCamera = () =>
  (lenses: Lens[], camera?: Camera): string[] => {
    if (!camera) return ['Any'];
    const compat = lenses.filter(l => l.mount === camera.mount).map(l => l.brand);
    return ['Any', ...Array.from(new Set(compat)).sort()];
  };

export const makeAvailabilitySelector = () =>
  (cameraName: string, camera: Camera | undefined, lenses: Lens[], f: any): Availability =>
    computeAvailability({
      cameraName,
      camera,
      lenses,
      brand: f.brand,
      lensType: f.lensType,
      sealed: f.sealed,
      isMacro: f.isMacro,
      priceRange: f.priceRange,
      weightRange: f.weightRange,
      proCoverage: f.proCoverage,
      proFocalMin: f.proFocalMin,
      proFocalMax: f.proFocalMax,
      proMaxApertureF: f.proMaxApertureF,
      proRequireOIS: f.proRequireOIS,
      proRequireSealed: f.proRequireSealed,
      proRequireMacro: f.proRequireMacro,
      proPriceMax: f.proPriceMax,
      proWeightMax: f.proWeightMax,
      proDistortionMaxPct: f.proDistortionMaxPct,
      proBreathingMinScore: f.proBreathingMinScore,
    });

export const makeResultsSelector = () =>
  (lenses: Lens[], camera: Camera | undefined, f: any): Result[] => {
    const filtered = applyFilters({
      lenses,
      cameraName: f.cameraName,
      cameraMount: camera?.mount,
      brand: f.brand,
      lensType: f.lensType,
      sealed: f.sealed,
      isMacro: f.isMacro,
      priceRange: f.priceRange,
      weightRange: f.weightRange,
      proCoverage: f.proCoverage,
      proFocalMin: f.proFocalMin,
      proFocalMax: f.proFocalMax,
      proMaxApertureF: f.proMaxApertureF,
      proRequireOIS: f.proRequireOIS,
      proRequireSealed: f.proRequireSealed,
      proRequireMacro: f.proRequireMacro,
      proPriceMax: f.proPriceMax,
      proWeightMax: f.proWeightMax,
      proDistortionMaxPct: f.proDistortionMaxPct,
      proBreathingMinScore: f.proBreathingMinScore,
      softPrice: f.softPrice,
      softWeight: f.softWeight,
      softDistortion: f.softDistortion,
      softBreathing: f.softBreathing,
    });
    const effectiveCamera = camera ?? {
      name: 'Any', brand: 'Any', mount: 'Any', ibis: false, price_chf: 0, weight_g: 0, source_url: '',
      sensor: { name: 'FF', width_mm: 36, height_mm: 24, coc_mm: 0.03, crop: 1 },
    };
    return computeResults({
      lenses: filtered,
      camera: effectiveCamera,
      goal_weights: f.goalWeights,
      focal_choice: f.focalChoice,
      isProMode: f.isPro,
      subject_distance_m: f.subjectDistanceM,
    });
  };


