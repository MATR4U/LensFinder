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
    if (!camera) {
      // Fallback: return minimally-augmented results without camera-specific scoring
      return filtered.map((lens) => {
        const focal_used_mm = (lens.focal_min_mm + lens.focal_max_mm) / 2;
        return {
          ...lens,
          focal_used_mm,
          max_aperture_at_focal: lens.aperture_min,
          eq_focal_ff_mm: focal_used_mm,
          fov_h_deg: 0,
          dof_total_m: 0,
          stabilization: lens.ois ? '✅' : '❌',
          score_total: 0,
        } as Result;
      });
    }
    return computeResults({
      lenses: filtered,
      camera,
      goal_weights: f.goalWeights,
      focal_choice: f.focalChoice,
      isProMode: f.isPro,
      subject_distance_m: f.subjectDistanceM,
    });
  };


