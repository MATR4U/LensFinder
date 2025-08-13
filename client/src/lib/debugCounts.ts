import type { Camera, Lens } from '../types';
import { coverageMatches } from './availability';
import { applyFilters } from './filters';

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
  const byAperture = byFocal.filter(l => (l.aperture_min ?? 99) <= args.proMaxApertureF);
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


export function computeDebugDistributions(args: {
  cameraName?: string;
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
  softDistortion?: boolean;
  softBreathing?: boolean;
}) {
  const base = args.cameraMount ? args.lenses.filter(l => l.mount === args.cameraMount) : args.lenses;
  const final = applyFilters({
    lenses: args.lenses,
    cameraName: args.cameraName || 'Any',
    cameraMount: args.cameraMount,
    brand: args.brand,
    lensType: args.lensType,
    sealed: args.sealed,
    isMacro: args.isMacro,
    priceRange: args.priceRange,
    weightRange: args.weightRange,
    proCoverage: args.proCoverage,
    proFocalMin: args.proFocalMin,
    proFocalMax: args.proFocalMax,
    proMaxApertureF: args.proMaxApertureF,
    proRequireOIS: args.proRequireOIS,
    proRequireSealed: args.proRequireSealed,
    proRequireMacro: args.proRequireMacro,
    proPriceMax: args.proPriceMax,
    proWeightMax: args.proWeightMax,
    proDistortionMaxPct: args.proDistortionMaxPct,
    proBreathingMinScore: args.proBreathingMinScore,
    softDistortion: args.softDistortion,
    softBreathing: args.softBreathing,
  });

  const hist = (arr: Lens[]) => ({
    byBrand: arr.reduce<Record<string, number>>((acc, l) => { acc[l.brand] = (acc[l.brand] || 0) + 1; return acc; }, {}),
    byType: arr.reduce<Record<string, number>>((acc, l) => { const t = (l.focal_min_mm === l.focal_max_mm) ? 'Prime' : 'Zoom'; acc[t] = (acc[t] || 0) + 1; return acc; }, {}),
  });

  return {
    base: hist(base),
    final: hist(final),
  } as const;
}

export function computeDebugPerCameraCounts(args: {
  cameras: Camera[];
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
  softDistortion?: boolean;
  softBreathing?: boolean;
}) {
  const counts: Record<string, number> = {};
  for (const cam of args.cameras) {
    counts[cam.name] = applyFilters({
      lenses: args.lenses,
      cameraName: cam.name,
      cameraMount: cam.mount,
      brand: args.brand,
      lensType: args.lensType,
      sealed: args.sealed,
      isMacro: args.isMacro,
      priceRange: args.priceRange,
      weightRange: args.weightRange,
      proCoverage: args.proCoverage,
      proFocalMin: args.proFocalMin,
      proFocalMax: args.proFocalMax,
      proMaxApertureF: args.proMaxApertureF,
      proRequireOIS: args.proRequireOIS,
      proRequireSealed: args.proRequireSealed,
      proRequireMacro: args.proRequireMacro,
      proPriceMax: args.proPriceMax,
      proWeightMax: args.proWeightMax,
      proDistortionMaxPct: args.proDistortionMaxPct,
      proBreathingMinScore: args.proBreathingMinScore,
      softDistortion: args.softDistortion,
      softBreathing: args.softBreathing,
    }).length;
  }
  return counts;
}

