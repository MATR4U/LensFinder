import { describe, it, expect } from 'vitest';
import { buildSpecFromState, applyWithPrefilters, type Mapping, type PreFilter } from '../src/adapters/app';
import { compile } from '../src/compile/compiler';
import { filter as fcFilter } from '../src/engine/filter';

type Lens = any;

const sampleState = {
  brand: 'Canon',
  sealed: true,
  isMacro: false,
  priceRange: { min: 200, max: 1500 },
  softPrice: false,
};

const mapping: Mapping = [
  { from: 'brand', to: 'brand', op: 'eq', when: s => (s as any).brand && (s as any).brand !== 'Any' },
  { from: 'sealed', to: 'weather_sealed', op: 'isTrue', when: s => (s as any).sealed === true },
  { from: 'priceRange', to: 'price_chf', op: 'between', transform: v => [ (v as any).min, (v as any).max ], mode: 'hard' },
];

const lenses: Lens[] = [
  { brand: 'Canon', weather_sealed: true, price_chf: 999, name: 'A' },
  { brand: 'Canon', weather_sealed: false, price_chf: 999, name: 'B' },
  { brand: 'Sony', weather_sealed: true, price_chf: 999, name: 'C' },
  { brand: 'Canon', weather_sealed: true, price_chf: 2001, name: 'D' },
];

describe('adapters/app', () => {
  it('buildSpecFromState emits expected clauses', () => {
    const spec = buildSpecFromState(sampleState, mapping);
    expect(spec.allOf && (spec.allOf as any[]).length).toBe(3);
  });

  it('applyWithPrefilters filters correctly', () => {
    const out = applyWithPrefilters(lenses, sampleState, mapping, []);
    expect(new Set(out.map(x => x.name))).toEqual(new Set(['A']));
  });

  it('manual compile+filter matches applyWithPrefilters', () => {
    const spec = buildSpecFromState(sampleState, mapping);
    const exec = compile(spec);
    const out1 = fcFilter(lenses, exec) as Lens[];
    const out2 = applyWithPrefilters(lenses, sampleState, mapping, []);
    expect(new Set(out1.map(x => x.name))).toEqual(new Set(out2.map(x => x.name)));
  });

  it('prefilter can gate dataset before spec runs', () => {
    const pf: PreFilter<Lens> = (data, _s) => data.filter(x => x.brand === 'Canon');
    const out = applyWithPrefilters(lenses, sampleState, mapping, [pf]);
    expect(out.every(x => x.brand === 'Canon')).toBe(true);
  });
});
