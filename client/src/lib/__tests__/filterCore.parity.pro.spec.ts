import { describe, it, expect } from 'vitest';
import { applyFilters, type FiltersInput } from '../filters';
import { compile, filter as fcFilter, type FilterSpec } from '@lensfinder/filter-core';
import { buildSpecFromFilters } from '../filterCoreAdapter';
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
  const { spec } = buildSpecFromFilters({ ...input, lenses: preLensType });
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

describe('parity: pro constraints', () => {
  const cases: Partial<FiltersInput>[] = [
    { proCoverage: 'Full Frame', proMaxApertureF: 2.8, proFocalMin: 24, proFocalMax: 200 },
    { proCoverage: 'APS-C', proMaxApertureF: 4, proFocalMin: 10, proFocalMax: 50 },
    { proCoverage: 'MFT', proMaxApertureF: 1.8, proFocalMin: 12, proFocalMax: 45 },
    { proCoverage: 'MF', proMaxApertureF: 4, proFocalMin: 50, proFocalMax: 120 },
  ];
  for (const c of cases) {
    it(`coverage=${c.proCoverage} focal=${c.proFocalMin}-${c.proFocalMax} maxF=${c.proMaxApertureF}`, () => {
      const input = makeInput(c);
      const a = legacy(input);
      const b = core(input);
      expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
    });
  }

  it('distortion and breathing soft vs hard', () => {
    const inputs: FiltersInput[] = [
      makeInput({ proDistortionMaxPct: 2, softDistortion: false }),
      makeInput({ proDistortionMaxPct: 5, softDistortion: true }),
      makeInput({ proBreathingMinScore: 6, softBreathing: false }),
      makeInput({ proBreathingMinScore: 4, softBreathing: true }),
    ];
    for (const input of inputs) {
      const a = legacy(input);
      const b = core(input);
      expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
    }
  });
});
