import { FilterSpec } from '../types';

export type QueryMappingEntry = { param: string; to: string; op: string; mode?: 'hard' | 'soft'; transformIn?: (s: string | null) => any; transformOut?: (v: any) => string; weight?: number };
export type QueryMapping = QueryMappingEntry[];

export function fromQueryParams(params: URLSearchParams, mapping: QueryMapping): FilterSpec {
  const clauses = mapping.map(m => {
    const raw = params.get(m.param);
    const v = m.transformIn ? m.transformIn(raw) : raw;
    return { path: m.to, op: m.op, value: v, mode: m.mode ?? 'hard', weight: m.weight ?? 1 };
  });
  return { allOf: clauses as any };
}

export function toQueryParams(spec: FilterSpec, mapping: QueryMapping): URLSearchParams {
  const search = new URLSearchParams();
  const clauses = (spec.allOf ?? []) as any[];
  mapping.forEach((m, i) => {
    const c = clauses[i];
    const v = m.transformOut ? m.transformOut(c?.value) : String(c?.value ?? '');
    if (v) search.set(m.param, v);
  });
  return search;
}
