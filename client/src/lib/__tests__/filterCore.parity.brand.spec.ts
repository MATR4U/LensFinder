import { describe, it, expect } from 'vitest';
import { applyFilters, type FiltersInput } from '../filters';
import { compile, filter as fcFilter, type FilterSpec, buildSpecFromState, type Mapping } from '@lensfinder/filter-core';
import type { Lens } from '../../types';
import lensesFixture from '../../../../server/tests/fixtures/lenses.json';
const allLenses = lensesFixture as unknown as Lens[];

function legacy(input: FiltersInput): Lens[] {
  return applyFilters(input);
}

function core(input: FiltersInput): Lens[] {
  const base = (input.cameraMount && input.cameraName !== 'Any')
    ? input.lenses.filter(l => l.mount === input.cameraMount)
    : input.lenses.slice();
  const preLensType = base.filter(l => {
    const type = l.focal_min_mm === l.focal_max_mm ? 'Prime' : 'Zoom';
    return input.lensType === 'Any' || !input.lensType ? true : type === input.lensType;
  });
  const mapping: Mapping = [
    { from: 'brand', to: 'brand', op: 'eq', when: (s: any) => s.brand && s.brand !== 'Any' },
    { from: 'sealed', to: 'weather_sealed', op: 'isTrue', when: (s: any) => s.sealed === true },
    { from: 'isMacro', to: 'is_macro', op: 'isTrue', when: (s: any) => s.isMacro === true },
    { from: 'priceRange', to: 'price_chf', op: 'between', mode: (st: any) => (st.softPrice ? 'soft' : 'hard'), transform: (v: any) => [ v.min, v.max ], weight: (st: any) => (st.softPrice ? 1 : undefined) },
    { from: 'weightRange', to: 'weight_g', op: 'between', mode: (st: any) => (st.softWeight ? 'soft' : 'hard'), transform: (v: any) => [ v.min, v.max ], weight: (st: any) => (st.softWeight ? 1 : undefined) },
    { from: 'proMaxApertureF', to: 'aperture_min', op: 'lte' },
    { from: 'proPriceMax', to: 'price_chf', op: 'lte' },
    { from: 'proWeightMax', to: 'weight_g', op: 'lte' },
    { from: 'proRequireOIS', to: 'ois', op: 'isTrue', when: (s: any) => s.proRequireOIS === true },
    { from: 'proRequireSealed', to: 'weather_sealed', op: 'isTrue', when: (s: any) => s.proRequireSealed === true },
    { from: 'proRequireMacro', to: 'is_macro', op: 'isTrue', when: (s: any) => s.proRequireMacro === true },
    { from: 'proDistortionMaxPct', to: 'distortion_pct', op: 'lte', mode: (st: any) => (st.softDistortion ? 'soft' : 'hard'), weight: (st: any) => (st.softDistortion ? 1 : undefined) },
    { from: 'proBreathingMinScore', to: 'focus_breathing_score', op: 'gte', mode: (st: any) => (st.softBreathing ? 'soft' : 'hard'), weight: (st: any) => (st.softBreathing ? 1 : undefined) },
  ];
  function withCoverageAnyOf(spec: any, state: any) {
    const val = state.proCoverage;
    if (!val || val === 'Any') return spec;
    const lc = String(val).toLowerCase();
    let syns: string[] = [];
    if (lc.includes('medium')) syns = ['Medium Format', 'MF'];
    else if (lc.includes('mft') || lc.includes('micro')) syns = ['MFT', 'Micro Four Thirds'];
    else if (lc.includes('aps')) syns = ['APS-C', 'APS C', 'APS'];
    else syns = ['Full Frame', 'FF'];
    const anyOf = syns.map(s => ({ path: 'coverage', op: 'includes', value: s, mode: 'hard' as const }));
    return { allOf: [ ...(spec.allOf ?? []), { anyOf } ] };
  }
  const spec0 = buildSpecFromState({ ...input }, mapping) as FilterSpec;
  const spec = withCoverageAnyOf(spec0, input) as FilterSpec;
  const exec = compile(spec as FilterSpec);
  return fcFilter(preLensType, exec) as Lens[];
}

function makeInput(overrides: Partial<FiltersInput> = {}): FiltersInput {
  return {
    lenses: allLenses,
    cameraName: 'Any',
    cameraMount: undefined,
    brand: 'Any',
    lensType: 'Any',
    sealed: false,
    isMacro: false,
    priceRange: { min: 0, max: 100000 },
    weightRange: { min: 0, max: 10000 },
    proCoverage: 'Any',
    proFocalMin: 0,
    proFocalMax: 10000,
    proMaxApertureF: 32,
    proRequireOIS: false,
    proRequireSealed: false,
    proRequireMacro: false,
    proPriceMax: 100000,
    proWeightMax: 10000,
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
    ...overrides,
  };
}

describe('parity: brand constraints', () => {
  const brands = ['Any', 'Canon', 'Sony', 'Nikon', 'Sigma', 'Tamron'];
  for (const brand of brands) {
    it(`brand=${brand}`, () => {
      const input = makeInput({ brand });
      const a = legacy(input);
      const b = core(input);
      expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
    });
  }
});
