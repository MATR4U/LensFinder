import { compile } from '../compile/compiler';
import { filter as runFilter } from '../engine/filter';
import type { FilterSpec } from '../types';

type ClauseMode = 'hard' | 'soft';
type ModeFn = (state: unknown) => ClauseMode;
type Weight = number | undefined;
type WeightFn = (state: unknown) => Weight;

export type MappingEntry = {
  from: string;
  to: string;
  op: string;
  mode?: ClauseMode | ModeFn;
  weight?: number | WeightFn;
  transform?: (v: unknown, state: unknown) => unknown;
  when?: (state: unknown) => boolean;
};

export type Mapping = MappingEntry[];

export type PreFilter<T> = (data: T[], state: unknown) => T[];

function get(obj: any, path: string): any {
  if (!path) return obj;
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p as any];
  }
  return cur;
}

export function buildSpecFromState(state: unknown, mapping: Mapping): FilterSpec {
  const clauses: any[] = [];
  for (const m of mapping) {
    if (m.when && !m.when(state)) continue;
    const raw = get(state as any, m.from);
    const val = m.transform ? m.transform(raw, state) : raw;
    const mode = typeof m.mode === 'function' ? (m.mode as ModeFn)(state) : (m.mode ?? 'hard');
    const weight = typeof m.weight === 'function' ? (m.weight as WeightFn)(state) : m.weight;
    clauses.push({ path: m.to, op: m.op, value: val, mode, weight });
  }
  return { allOf: clauses as any };
}

export function applyWithPrefilters<T>(data: T[], state: unknown, mapping: Mapping, prefilters: PreFilter<T>[] = []): T[] {
  let cur = data;
  for (const pf of prefilters) {
    cur = pf(cur, state);
  }
  const spec = buildSpecFromState(state, mapping);
  const exec = compile(spec);
  const out = runFilter(cur as any[], exec) as T[];
  return out;
}
