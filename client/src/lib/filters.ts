import type { Lens } from '../types';
import { coverageMatches } from './availability';

export type FiltersInput = {
  lenses: Lens[];
  cameraName: string;
  cameraMount?: string;
  brand: string;
  lensType: string;
  sealed: boolean;
  isMacro: boolean;
  priceRange: { min: number; max: number };
  weightRange: { min: number; max: number };
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
  softPrice?: boolean;
  softWeight?: boolean;
  softDistortion?: boolean;
  softBreathing?: boolean;
};

export function applyFilters(input: FiltersInput): Lens[] {
  const {
    lenses,
    cameraName,
    cameraMount,
    brand,
    lensType,
    sealed,
    isMacro,
    priceRange,
    weightRange,
    proCoverage,
    proFocalMin,
    proFocalMax,
    proMaxApertureF,
    proRequireOIS,
    proRequireSealed,
    proRequireMacro,
    proPriceMax,
    proWeightMax,
    proDistortionMaxPct,
    proBreathingMinScore
  } = input;

  const base = cameraMount && cameraName !== 'Any' ? lenses.filter(l => l.mount === cameraMount) : lenses.slice();
  const applyFocalRange = (proFocalMin > 0) || (proFocalMax < 9999);

  return base
    .filter((l) => (brand === 'Any' ? true : l.brand === brand))
    .filter((l) => {
      const type = l.focal_min_mm === l.focal_max_mm ? 'Prime' : 'Zoom';
      return lensType === 'Any' ? true : type === lensType;
    })
    .filter((l) => (sealed ? l.weather_sealed : true))
    .filter((l) => (isMacro ? l.is_macro : true))
    .filter((l) => (input.softPrice ? true : (l.price_chf >= priceRange.min && l.price_chf <= priceRange.max)))
    .filter((l) => (input.softWeight ? true : (l.weight_g >= weightRange.min && l.weight_g <= weightRange.max)))
    .filter((l) => coverageMatches(l.coverage, proCoverage))
    .filter((l) => !applyFocalRange ? true : ((l.focal_min_mm ?? 0) <= proFocalMin && (l.focal_max_mm ?? 0) >= proFocalMax))
    .filter((l) => (l.aperture_min ?? 99) <= proMaxApertureF)
    .filter((l) => (proRequireOIS ? !!l.ois : true))
    .filter((l) => (proRequireSealed ? !!l.weather_sealed : true))
    .filter((l) => (proRequireMacro ? !!l.is_macro : true))
    .filter((l) => (l.price_chf ?? Infinity) <= proPriceMax)
    .filter((l) => (l.weight_g ?? Infinity) <= proWeightMax)
    .filter((l) => (input.softDistortion ? true : ((l.distortion_pct ?? 0) <= proDistortionMaxPct)))
    .filter((l) => (input.softBreathing ? true : ((l.focus_breathing_score ?? 0) >= proBreathingMinScore)));
}


