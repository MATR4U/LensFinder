import { describe, it, expect } from 'vitest';
import { applyFilters, type FiltersInput } from '../filters';
import { compile, filter as fcFilter, type FilterSpec } from '@lensfinder/filter-core';
import { buildSpecFromFilters } from '../filterCoreAdapter';
import type { Lens } from '../../types';
import lensesFixture from '../../../../server/tests/fixtures/lenses.json';
const allLenses = lensesFixture as unknown as Lens[];

/**
 * Parity test ensuring that for a representative matrix of filter settings,
 * the new filter-core path returns the same set of lenses as the legacy path.
 */
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
  const out = fcFilter(preLensType, exec) as Lens[];
  return out;
}

function makeInput(overrides: Partial<FiltersInput>): FiltersInput {
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

describe('filter-core parity with legacy filtering', () => {
  const brands = ['Any', 'Canon', 'Sony'];
  const types = ['Any', 'Prime', 'Zoom'] as const;

  it('baseline: Any/Any, wide ranges', () => {
    const input = makeInput({});
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('brand-only constraints', () => {
    for (const brand of brands) {
      const input = makeInput({ brand });
      const a = legacy(input);
      const b = core(input);
      expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
    }
  });

  it('lens type gating parity', () => {
    for (const lensType of types) {
      const input = makeInput({ lensType });
      const a = legacy(input);
      const b = core(input);
      expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
    }
  });

  it('price and weight ranges (hard)', () => {
    const input = makeInput({
      priceRange: { min: 300, max: 1500 },
      weightRange: { min: 0, max: 900 },
    });
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('feature toggles: sealed + macro', () => {
    const input = makeInput({
      sealed: true,
      isMacro: true,
    });
    const a = legacy(input);
    const b = core(input);
    expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
  });

  it('pro constraints: coverage synonyms and aperture/focal bounds', () => {
    const inputs: FiltersInput[] = [
      makeInput({ proCoverage: 'Full Frame', proMaxApertureF: 2.8, proFocalMin: 24, proFocalMax: 200 }),
      makeInput({ proCoverage: 'APS-C', proMaxApertureF: 4, proFocalMin: 10, proFocalMax: 50 }),
      makeInput({ proCoverage: 'MFT', proMaxApertureF: 1.8, proFocalMin: 12, proFocalMax: 45 }),
    ];
    for (const input of inputs) {
      const a = legacy(input);
      const b = core(input);
      expect(new Set(b.map(x => x.source_url || x.name))).toEqual(new Set(a.map(x => x.source_url || x.name)));
    }
  });
});
