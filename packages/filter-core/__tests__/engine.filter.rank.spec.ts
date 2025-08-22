import { describe, it, expect } from 'vitest';
import { filter } from '../src/engine/filter';
import { rank } from '../src/engine/rank';
import { compile } from '../src/compile/compiler';

type Item = { id: number; a: number; b: string; tags: string[]; vec: number[] };

const data: Item[] = [
  { id: 1, a: 1, b: 'alpha', tags: ['x'], vec: [1, 0] },
  { id: 2, a: 2, b: 'beta', tags: ['y'], vec: [0.8, 0.2] },
  { id: 3, a: 3, b: 'gamma', tags: ['x','z'], vec: [0, 1] },
];

describe('filter/rank', () => {
  it('filters with hard constraints', () => {
    const spec = { allOf: [{ path: 'a', op: 'gte', value: 2, mode: 'hard' }] } as any;
    const out = filter(data, spec) as Item[];
    expect(out.map(x => x.id)).toEqual([2,3]);
  });
  it('ranks with soft constraints', () => {
    const spec = { allOf: [{ path: 'a', op: 'gte', value: 1, mode: 'hard' }, { path: 'a', op: 'lte', value: 3, mode: 'soft', weight: 1 }] } as any;
    const out = rank(data, spec, { topK: 2 }) as Array<{ item: Item; score: number }>;
    expect(out.length).toBe(2);
  });
  it('compile and explain parts consistency', () => {
    const spec = { allOf: [{ path: 'b', op: 'includes', value: 'al', mode: 'hard' }] } as any;
    const exec = compile(spec);
    expect(exec.test(data[0])).toBe(true);
    expect(exec.test(data[1])).toBe(false);
  });
});
