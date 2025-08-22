import { Executable, FilterSpec, RankOptions } from '../types';
import { compile } from '../compile/compiler';
import { TopK } from './heap';
import { tieBreak } from './sort';

function reduceScores(parts: number[], reducer?: RankOptions['scoreReducer']): number {
  if (!reducer || reducer === 'sum' || reducer === 'weightedSum') return parts.reduce((a, b) => a + b, 0);
  if (reducer === 'min') return parts.reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
  if (reducer === 'max') return parts.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
  if (typeof reducer === 'function') return reducer(parts);
  return parts.reduce((a, b) => a + b, 0);
}

export async function rankAsync<T>(iter: AsyncIterable<T>, execOrSpec: Executable | FilterSpec, options: RankOptions = {}) {
  const exec = (execOrSpec as any).test ? execOrSpec as Executable : compile(execOrSpec as FilterSpec);
  const topK = typeof options.topK === 'number' && options.topK > 0 ? new TopK<T>(options.topK) : undefined;
  const res: Array<{ item: T; score: number; details: { total: number; parts: number[] } }> = [];
  for await (const item of iter) {
    if (!exec.test(item)) continue;
    const details = exec.score(item);
    const score = reduceScores(details.parts, options.scoreReducer);
    if (topK) topK.push(score, item);
    else res.push({ item, score, details });
  }
  const out = topK ? topK.values().map(v => ({ item: v.item, score: v.score, details: { total: v.score, parts: [] as number[] } })) : res.sort((a, b) => b.score - a.score);
  const limited = typeof options.limit === 'number' ? out.slice(options.offset ?? 0, (options.offset ?? 0) + options.limit) : out;
  const items = limited.map(x => x.item);
  const tb = options.tieBreakers?.length ? tieBreak(items, options.tieBreakers) : items;
  const map = new Map(items.map((it, i) => [it, limited[i].score]));
  return tb.map(it => ({ item: it, score: map.get(it) as number, details: { total: map.get(it) as number, parts: [] as number[] } }));
}

export function rank<T>(data: T[] | AsyncIterable<T>, execOrSpec: Executable | FilterSpec, options: RankOptions = {}) {
  if (Symbol.asyncIterator in (data as any)) return rankAsync(data as AsyncIterable<T>, execOrSpec, options);
  const exec = (execOrSpec as any).test ? execOrSpec as Executable : compile(execOrSpec as FilterSpec);
  const res: Array<{ item: T; score: number; details: { total: number; parts: number[] } }> = [];
  const arr = data as T[];
  for (const item of arr) {
    if (!exec.test(item)) continue;
    const details = exec.score(item);
    const score = reduceScores(details.parts, options.scoreReducer);
    res.push({ item, score, details });
  }
  res.sort((a, b) => b.score - a.score);
  const topApplied = typeof options.topK === 'number' && options.topK > 0 ? res.slice(0, options.topK) : res;
  const sliced = typeof options.limit === 'number'
    ? topApplied.slice(options.offset ?? 0, (options.offset ?? 0) + options.limit)
    : topApplied;
  const items = sliced.map(x => x.item);
  const tb = options.tieBreakers?.length ? tieBreak(items, options.tieBreakers) : items;
  const map = new Map(items.map((it, i) => [it, sliced[i].score]));
  return tb.map(it => ({ item: it, score: map.get(it) as number, details: { total: map.get(it) as number, parts: [] as number[] } }));
}
