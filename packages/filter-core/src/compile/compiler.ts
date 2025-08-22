import { makeGetter } from './accessors';
import { Clause, Executable, FilterSpec } from '../types';
import * as numOps from '../ops/numeric';
import * as strOps from '../ops/string';
import * as arrOps from '../ops/array';
import * as boolOps from '../ops/boolean';
import * as vecOps from '../ops/vector';

type CompiledClause = {
  clause: Clause;
  getter: (o: any) => any;
  hard: (val: any) => boolean;
  soft: (val: any) => number;
  weight: number;
};

function flatten(spec: FilterSpec, acc: Clause[] = []): Clause[] {
  if ((spec as any).path) {
    acc.push(spec as unknown as Clause);
    return acc;
  }
  if (spec.allOf) spec.allOf.forEach(s => flatten(s as any, acc));
  if (spec.anyOf) spec.anyOf.forEach(s => flatten(s as any, acc));
  if (spec.not) flatten(spec.not as any, acc);
  return acc;
}

function factoryFor(op: string): { hard: (v: any) => (x: any) => boolean; soft: (x: any, v: any) => number } {
  if ((numOps as any).OPS?.includes(op)) return { hard: (v: any) => (numOps as any).cmpFactory(op, v), soft: (x: any, v: any) => (numOps as any).softScore(op, x, v) };
  if ((strOps as any).OPS?.includes(op)) return { hard: (v: any) => (strOps as any).cmpFactory(op, v), soft: (x: any, v: any) => (strOps as any).softScore(op, x, v) };
  if ((arrOps as any).OPS?.includes(op)) return { hard: (v: any) => (arrOps as any).cmpFactory(op, v), soft: (x: any, v: any) => (arrOps as any).softScore(op, x, v) };
  if ((boolOps as any).OPS?.includes(op)) return { hard: (v: any) => (boolOps as any).cmpFactory(op, v), soft: (x: any, v: any) => (boolOps as any).softScore(op, x, v) };
  if ((vecOps as any).OPS?.includes(op)) return { hard: (v: any) => (vecOps as any).cmpFactory(op, v), soft: (x: any, v: any) => (vecOps as any).softScore(op, x, v) };
  return { hard: () => () => false, soft: () => 0 };
}

export function compile(spec: FilterSpec): Executable {
  const clauses = flatten(spec);
  const compiled: CompiledClause[] = clauses.map(c => {
    const { hard, soft } = factoryFor(c.op);
    return {
      clause: c,
      getter: makeGetter(c.path),
      hard: hard(c.value),
      soft: (val: any) => soft(val, c.value),
      weight: c.weight ?? 1
    };
  });
  return {
    clauses,
    test: (item: any) => {
      for (const c of compiled) {
        const v = c.getter(item);
        const mode = c.clause.mode ?? 'hard';
        if (mode === 'hard' && !c.hard(v)) return false;
      }
      return true;
    },
    score: (item: any) => {
      const parts: number[] = [];
      for (const c of compiled) {
        const v = c.getter(item);
        const mode = c.clause.mode ?? 'hard';
        if (mode === 'soft') {
          parts.push(c.weight * c.soft(v));
        } else {
          parts.push(0);
        }
      }
      const total = parts.reduce((a, b) => a + b, 0);
      return { total, parts };
    }
  };
}
