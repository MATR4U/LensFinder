import type { Camera, Lens } from '../types';

export type Availability = {
  brands: string[];
  lensTypes: string[];
  coverage: string[];
  priceBounds: { min: number; max: number };
  weightBounds: { min: number; max: number };
  focalBounds: { min: number; max: number };
  // Optional UI aids derived from availability
  priceTicks?: number[];
  weightTicks?: number[];
  focalTicks?: number[];
  apertureMaxMax: number;
  distortionMaxMax: number;
  breathingMinMin: number;
};

export function coverageMatches(lensCoverage: string | undefined, selection: string): boolean {
  if (selection === 'Any') return true;
  const synonyms: Record<string, string[]> = {
    'Full Frame': ['FF', 'Full Frame'],
    'APS-C': ['APS-C', 'APS C', 'APS'],
    'MFT': ['MFT', 'Micro Four Thirds'],
    'Medium Format': ['Medium Format', 'MF']
  };
  const options = synonyms[selection] || [selection];
  const lc = (lensCoverage || '').toLowerCase();
  return options.some((opt) => lc.includes(opt.toLowerCase()));
}

type AvailabilityArgs = {
  cameraName: string;
  camera?: Camera;
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
};

export function computeAvailability(args: AvailabilityArgs): Availability {
  const {
    cameraName,
    camera,
    lenses,
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
  } = args;

  const base = (camera && cameraName !== 'Any') ? lenses.filter(l => l.mount === camera.mount) : lenses.slice();

  function applyAll(except: Set<string> = new Set()) {
    let arr = base.slice();
    if (!except.has('brand')) arr = arr.filter(l => (brand === 'Any' ? true : l.brand === brand));
    if (!except.has('lensType')) arr = arr.filter(l => {
      const type = l.focal_min_mm === l.focal_max_mm ? 'Prime' : 'Zoom';
      return lensType === 'Any' ? true : type === lensType;
    });
    arr = arr
      .filter(l => (sealed ? l.weather_sealed : true))
      .filter(l => (isMacro ? l.is_macro : true));
    if (!except.has('priceRange')) arr = arr.filter(l => l.price_chf >= priceRange.min && l.price_chf <= priceRange.max);
    if (!except.has('weightRange')) arr = arr.filter(l => l.weight_g >= weightRange.min && l.weight_g <= weightRange.max);
    if (!except.has('coverage')) arr = arr.filter(l => coverageMatches(l.coverage, proCoverage));
    const applyFocalRange = (proFocalMin > 0) || (proFocalMax < 9999);
    arr = arr
      .filter(l => (except.has('focalRange') ? true : (!applyFocalRange ? true : ((l.focal_min_mm ?? 0) <= proFocalMin && (l.focal_max_mm ?? 0) >= proFocalMax))))
      .filter(l => (except.has('apertureMax') ? true : ((l.aperture_max ?? 99) <= proMaxApertureF)))
      .filter(l => (proRequireOIS ? !!l.ois : true))
      .filter(l => (proRequireSealed ? !!l.weather_sealed : true))
      .filter(l => (proRequireMacro ? !!l.is_macro : true))
      .filter(l => (except.has('proPriceMax') ? true : ((l.price_chf ?? Infinity) <= proPriceMax)))
      .filter(l => (except.has('proWeightMax') ? true : ((l.weight_g ?? Infinity) <= proWeightMax)))
      .filter(l => (except.has('distortionMax') ? true : ((l.distortion_pct ?? 0) <= proDistortionMaxPct)))
      .filter(l => (except.has('breathingMin') ? true : ((l.focus_breathing_score ?? 0) >= proBreathingMinScore)));
    return arr;
  }

  const forBrands = applyAll(new Set(['brand']));
  const brandsSet = Array.from(new Set(forBrands.map(l => l.brand))).sort();
  const brands = ['Any', ...brandsSet];

  const forLensType = applyAll(new Set(['lensType']));
  const hasPrime = forLensType.some(l => l.focal_min_mm === l.focal_max_mm);
  const hasZoom = forLensType.some(l => l.focal_min_mm !== l.focal_max_mm);
  const lensTypes = ['Any', ...(hasPrime ? ['Prime'] : []), ...(hasZoom ? ['Zoom'] : [])];

  const forCoverage = applyAll(new Set(['coverage']));
  const canonical = (cov?: string) => {
    const c = (cov || '').toLowerCase();
    if (c.includes('medium')) return 'Medium Format';
    if (c.includes('mft') || c.includes('micro')) return 'MFT';
    if (c.includes('aps')) return 'APS-C';
    return 'Full Frame';
  };
  const covSet = Array.from(new Set(forCoverage.map(l => canonical(l.coverage)))).sort();
  const coverage = ['Any', ...covSet];

  const forPrice = applyAll(new Set(['priceRange', 'proPriceMax']));
  const priceVals = forPrice.map(l => l.price_chf).filter(v => Number.isFinite(v));
  const rawPriceBounds = { min: priceVals.length ? Math.min(...priceVals) : 0, max: priceVals.length ? Math.max(...priceVals) : 8000 };
  const priceBounds = { min: Math.floor(Math.max(0, rawPriceBounds.min)), max: Math.ceil(rawPriceBounds.max) };

  const forWeight = applyAll(new Set(['weightRange', 'proWeightMax']));
  const weightVals = forWeight.map(l => l.weight_g).filter(v => Number.isFinite(v));
  const rawWeightBounds = { min: weightVals.length ? Math.min(...weightVals) : 0, max: weightVals.length ? Math.max(...weightVals) : 3000 };
  const weightBounds = { min: Math.floor(Math.max(0, rawWeightBounds.min)), max: Math.ceil(rawWeightBounds.max) };

  // Build simple ticks for UI snapping (even spacing across available bounds)
  const makeTicks = (minVal: number, maxVal: number, segments = 8) => {
    if (!Number.isFinite(minVal) || !Number.isFinite(maxVal) || maxVal <= minVal) return [minVal, maxVal];
    const step = (maxVal - minVal) / segments;
    const arr: number[] = [];
    for (let i = 0; i <= segments; i += 1) arr.push(Math.round(minVal + i * step));
    // Ensure exact ends
    arr[0] = minVal; arr[arr.length - 1] = maxVal;
    return Array.from(new Set(arr));
  };
  const priceTicks = makeTicks(priceBounds.min, priceBounds.max);
  const weightTicks = makeTicks(weightBounds.min, weightBounds.max);

  // Compute focal bounds WITHOUT applying the focal range filter to avoid feedback loops
  const afterNoFocal = applyAll(new Set(['focalRange']));
  const focalMinVals = afterNoFocal.map(l => l.focal_min_mm ?? 0);
  const focalMaxVals = afterNoFocal.map(l => l.focal_max_mm ?? 0);
  const rawFocalBounds = {
    min: focalMinVals.length ? Math.min(...focalMinVals) : 0,
    max: focalMaxVals.length ? Math.max(...focalMaxVals) : 9999
  };
  const focalBounds = { min: Math.floor(Math.max(0, rawFocalBounds.min)), max: Math.ceil(rawFocalBounds.max) };
  const focalTicks = makeTicks(focalBounds.min, focalBounds.max);

  const afterNoAperture = applyAll(new Set(['apertureMax']));
  const apertureVals = afterNoAperture.map(l => l.aperture_max ?? 99).filter(v => Number.isFinite(v));
  const apertureMaxMax = Math.min(99, (apertureVals.length ? Math.max(...apertureVals) : 99));
  const afterNoDistortion = applyAll(new Set(['distortionMax']));
  const distVals = afterNoDistortion.map(l => l.distortion_pct ?? 0).filter(v => Number.isFinite(v));
  const distortionMaxMax = (distVals.length ? Math.max(...distVals) : 100);
  const afterNoBreathing = applyAll(new Set(['breathingMin']));
  const breathingVals = afterNoBreathing.map(l => l.focus_breathing_score ?? 0).filter(v => Number.isFinite(v));
  const breathingMinMin = Math.max(0, (breathingVals.length ? Math.min(...breathingVals) : 0));

  return { brands, lensTypes, coverage, priceBounds, weightBounds, focalBounds, priceTicks, weightTicks, focalTicks, apertureMaxMax, distortionMaxMax, breathingMinMin };
}


