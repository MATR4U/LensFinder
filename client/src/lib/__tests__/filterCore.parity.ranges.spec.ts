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

describe('parity: price/weight ranges and soft vs hard', () => {
  it('hard mid ranges', () => {
    const input = makeInput({
      priceRange: { min: 200, max: 2000 },
      weightRange: { min: 0, max: 900 },
      softPrice: false,
      softWeight: false,
    });
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('soft price, hard weight', () => {
    const input = makeInput({
      priceRange: { min: 200, max: 1200 },
      weightRange: { min: 0, max: 1200 },
      softPrice: true,
      softWeight: false,
    });
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('extreme tight budget', () => {
    const input = makeInput({
      priceRange: { min: 0, max: 300 },
      weightRange: { min: 0, max: 5000 },
    });
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('extreme lightweight', () => {
    const input = makeInput({
      priceRange: { min: 0, max: 100000 },
      weightRange: { min: 0, max: 300 },
    });
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('snapshot: mid budget and portable', () => {
    const input = makeInput({
      priceRange: { min: 300, max: 1500 },
      weightRange: { min: 0, max: 900 },
      softPrice: false,
      softWeight: false,
    });
    const b = core(input);
    const keys = b.map(x => x.source_url || x.name).sort();
    expect(keys).toMatchSnapshot();
  });
});
