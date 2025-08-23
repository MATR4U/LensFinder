import { describe, it, expect } from 'vitest';
import { fromQueryParams, toQueryParams, type QueryMapping } from '../src/adapters/router';

const mapping: QueryMapping = [
  { param: 'brand', to: 'brand', op: 'eq' },
  { param: 'sealed', to: 'weather_sealed', op: 'isTrue', transformIn: s => s === 'true', transformOut: v => (v ? 'true' : 'false') },
  { param: 'priceMin', to: 'price_chf', op: 'between', transformIn: s => [Number(s), 1000] as any, transformOut: v => String((v as any)[0]) },
];

describe('adapters/router', () => {
  it('fromQueryParams produces a FilterSpec', () => {
    const sp = new URLSearchParams({ brand: 'Canon', sealed: 'true', priceMin: '200' });
    const spec = fromQueryParams(sp, mapping);
    expect(spec.allOf && (spec.allOf as any[]).length).toBe(3);
  });

  it('toQueryParams round-trips key fields', () => {
    const sp = new URLSearchParams({ brand: 'Canon', sealed: 'true', priceMin: '200' });
    const spec = fromQueryParams(sp, mapping);
    const out = toQueryParams(spec, mapping);
    expect(out.get('brand')).toBe('Canon');
    expect(out.get('sealed')).toBe('true');
    expect(out.get('priceMin')).toBe('200');
  });
});
