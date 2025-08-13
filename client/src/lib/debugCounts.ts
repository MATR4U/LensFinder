import type { Lens } from '../types';
import { coverageMatches } from './availability';

export function computeDebugCounts(args: {
  cameraMount?: string;
  lenses: Lens[];
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
}) {
  const base = args.cameraMount ? args.lenses.filter(l => l.mount === args.cameraMount) : args.lenses;
  const counts: Record<string, number> = {};
  counts.mount = base.length;
  const byBrand = base.filter(l => (args.brand === 'Any' ? true : l.brand === args.brand));
  counts.brand = byBrand.length;
  const byType = byBrand.filter(l => {
    const type = l.focal_min_mm === l.focal_max_mm ? 'Prime' : 'Zoom';
    return args.lensType === 'Any' ? true : type === args.lensType;
  });
  counts.type = byType.length;
  const bySealed = byType.filter(l => (args.sealed ? l.weather_sealed : true));
  counts.sealed = bySealed.length;
  const byMacro = bySealed.filter(l => (args.isMacro ? l.is_macro : true));
  counts.macro = byMacro.length;
  const byPriceRange = byMacro.filter(l => l.price_chf >= args.priceRange.min && l.price_chf <= args.priceRange.max);
  counts.priceRange = byPriceRange.length;
  const byWeightRange = byPriceRange.filter(l => l.weight_g >= args.weightRange.min && l.weight_g <= args.weightRange.max);
  counts.weightRange = byWeightRange.length;
  const byCoverage = byWeightRange.filter(l => coverageMatches(l.coverage, args.proCoverage));
  counts.coverage = byCoverage.length;
  const applyFocalRange = (args.proFocalMin > 0) || (args.proFocalMax < 9999);
  const byFocal = byCoverage.filter(l => !applyFocalRange ? true : ((l.focal_min_mm ?? 0) <= args.proFocalMin && (l.focal_max_mm ?? 0) >= args.proFocalMax));
  counts.focal = byFocal.length;
  const byAperture = byFocal.filter(l => (l.aperture_max ?? 99) <= args.proMaxApertureF);
  counts.aperture = byAperture.length;
  const byOIS = byAperture.filter(l => (args.proRequireOIS ? !!l.ois : true));
  counts.ois = byOIS.length;
  const byProSealed = byOIS.filter(l => (args.proRequireSealed ? !!l.weather_sealed : true));
  counts.proSealed = byProSealed.length;
  const byProMacro = byProSealed.filter(l => (args.proRequireMacro ? !!l.is_macro : true));
  counts.proMacro = byProMacro.length;
  const byProPrice = byProMacro.filter(l => (l.price_chf ?? Infinity) <= args.proPriceMax);
  counts.proPriceMax = byProPrice.length;
  const byProWeight = byProPrice.filter(l => (l.weight_g ?? Infinity) <= args.proWeightMax);
  counts.proWeightMax = byProWeight.length;
  const byDistortion = byProWeight.filter(l => (l.distortion_pct ?? 0) <= args.proDistortionMaxPct);
  counts.distortion = byDistortion.length;
  const byBreathing = byDistortion.filter(l => (l.focus_breathing_score ?? 0) >= args.proBreathingMinScore);
  counts.breathing = byBreathing.length;
  return counts;
}


