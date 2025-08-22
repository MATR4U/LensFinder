import { describe, it, expect } from 'vitest';
import { cmpFactory, softScore } from '../src/ops/numeric';

describe('numeric ops', () => {
  it('eq', () => {
    const f = cmpFactory('eq', 3);
    expect(f(3)).toBe(true);
    expect(f(2)).toBe(false);
  });
  it('lte/gte', () => {
    expect(cmpFactory('lte', 5)(4)).toBe(true);
    expect(cmpFactory('gte', 5)(6)).toBe(true);
  });
  it('between', () => {
    const f = cmpFactory('between', [2, 4]);
    expect(f(3)).toBe(true);
    expect(f(1)).toBe(false);
  });
  it('softScore', () => {
    expect(softScore('between', 3, [2, 4])).toBe(1);
  });
});
