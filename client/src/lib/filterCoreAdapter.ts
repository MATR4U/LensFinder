import type { FiltersInput } from './filters';
import type { FilterSpec, RankOptions } from '@lensfinder/filter-core';

function coverageSynonyms(selection: string | undefined): string[] {
  if (!selection || selection === 'Any') return [];
  const lc = selection.toLowerCase();
  if (lc.includes('medium')) return ['Medium Format', 'MF'];
  if (lc.includes('mft') || lc.includes('micro')) return ['MFT', 'Micro Four Thirds'];
  if (lc.includes('aps')) return ['APS-C', 'APS C', 'APS'];
  return ['Full Frame', 'FF'];
}

export function buildSpecFromFilters(input: FiltersInput): { spec: FilterSpec; rank?: RankOptions } {
  const allOf: any[] = [];

  if (input.brand && input.brand !== 'Any') {
    allOf.push({ path: 'brand', op: 'eq', value: input.brand, mode: 'hard' });
  }

  if (input.sealed) {
    allOf.push({ path: 'weather_sealed', op: 'isTrue', mode: 'hard' });
  }
  if (input.isMacro) {
    allOf.push({ path: 'is_macro', op: 'isTrue', mode: 'hard' });
  }

  if (input.enablePrice !== false) {
    if (input.softPrice) {
      allOf.push({ path: 'price_chf', op: 'between', value: [input.priceRange.min, input.priceRange.max], mode: 'soft', weight: 1 });
    } else {
      allOf.push({ path: 'price_chf', op: 'between', value: [input.priceRange.min, input.priceRange.max], mode: 'hard' });
    }
  }

  if (input.enableWeight !== false) {
    if (input.softWeight) {
      allOf.push({ path: 'weight_g', op: 'between', value: [input.weightRange.min, input.weightRange.max], mode: 'soft', weight: 1 });
    } else {
      allOf.push({ path: 'weight_g', op: 'between', value: [input.weightRange.min, input.weightRange.max], mode: 'hard' });
    }
  }

  if (input.proCoverage && input.proCoverage !== 'Any') {
    const syns = coverageSynonyms(input.proCoverage);
    if (syns.length) {
      const anyOf = syns.map(s => ({ path: 'coverage', op: 'includes', value: s, mode: 'hard' }));
      allOf.push({ anyOf });
    }
  }

  const applyFocalRange = (input.proFocalMin > 0) || (input.proFocalMax < 9999);
  if (applyFocalRange) {
    allOf.push({ path: 'focal_min_mm', op: 'lte', value: input.proFocalMin, mode: 'hard' });
    allOf.push({ path: 'focal_max_mm', op: 'gte', value: input.proFocalMax, mode: 'hard' });
  }

  allOf.push({ path: 'aperture_min', op: 'lte', value: input.proMaxApertureF, mode: 'hard' });

  if (input.proRequireOIS) allOf.push({ path: 'ois', op: 'isTrue', mode: 'hard' });
  if (input.proRequireSealed) allOf.push({ path: 'weather_sealed', op: 'isTrue', mode: 'hard' });
  if (input.proRequireMacro) allOf.push({ path: 'is_macro', op: 'isTrue', mode: 'hard' });

  allOf.push({ path: 'price_chf', op: 'lte', value: input.proPriceMax, mode: 'hard' });
  allOf.push({ path: 'weight_g', op: 'lte', value: input.proWeightMax, mode: 'hard' });

  if (input.enableDistortion !== false) {
    const clause = { path: 'distortion_pct', op: 'lte', value: input.proDistortionMaxPct, mode: input.softDistortion ? 'soft' : 'hard', weight: input.softDistortion ? 1 : undefined };
    allOf.push(clause);
  }
  if (input.enableBreathing !== false) {
    const clause = { path: 'focus_breathing_score', op: 'gte', value: input.proBreathingMinScore, mode: input.softBreathing ? 'soft' : 'hard', weight: input.softBreathing ? 1 : undefined };
    allOf.push(clause);
  }

  const spec: FilterSpec = { allOf };
  return { spec };
}
