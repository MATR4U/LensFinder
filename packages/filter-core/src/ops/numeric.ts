export const OPS = ['eq','neq','lt','lte','gt','gte','between','inRange','approx'] as const;

export function cmpFactory(op: string, value: any) {
  if (op === 'eq') return (x: any) => x === value;
  if (op === 'neq') return (x: any) => x !== value;
  if (op === 'lt') return (x: any) => typeof x === 'number' && x < value;
  if (op === 'lte') return (x: any) => typeof x === 'number' && x <= value;
  if (op === 'gt') return (x: any) => typeof x === 'number' && x > value;
  if (op === 'gte') return (x: any) => typeof x === 'number' && x >= value;
  if (op === 'between') {
    const [a, b] = value as [number, number];
    return (x: any) => typeof x === 'number' && x >= a && x <= b;
  }
  if (op === 'inRange') {
    const [a, b] = value as [number, number];
    return (x: any) => typeof x === 'number' && x >= a && x <= b;
  }
  if (op === 'approx') {
    const eps = typeof value === 'number' ? 1e-6 : (value?.eps ?? 1e-3);
    const target = typeof value === 'number' ? value : value?.target;
    return (x: any) => typeof x === 'number' && Math.abs(x - target) <= eps;
  }
  return () => false;
}
export function softScore(op: string, x: any, value: any): number {
  if (typeof x !== 'number') return 0;
  if (op === 'eq') return x === value ? 1 : 0;
  if (op === 'lte') return x <= value ? 1 : 1 / (1 + (x - value));
  if (op === 'gte') return x >= value ? 1 : 1 / (1 + (value - x));
  if (op === 'between' || op === 'inRange') {
    const [a, b] = value as [number, number];
    if (x >= a && x <= b) return 1;
    const d = x < a ? a - x : x - b;
    return 1 / (1 + d);
  }
  return 0;
}
