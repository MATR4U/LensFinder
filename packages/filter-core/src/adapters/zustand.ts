import { FilterSpec } from '../types';

export type MappingEntry = { to: string; op: string; mode?: 'hard' | 'soft'; transform?: (v: any) => any; weight?: number };
export type Mapping = { [storePath: string]: MappingEntry };

function get(obj: any, path: string): any {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p as any];
  }
  return cur;
}

export function fromStore(state: unknown, mapping: Mapping): FilterSpec {
  const clauses = Object.entries(mapping).map(([from, meta]) => {
    const v = meta.transform ? meta.transform(get(state, from)) : get(state, from);
    return { path: meta.to, op: meta.op, value: v, mode: meta.mode ?? 'hard', weight: meta.weight ?? 1 };
  });
  return { allOf: clauses as any };
}
