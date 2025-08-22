export const OPS = ['in','notIn','arrayContains','arrayIntersects'] as const;

export function cmpFactory(op: string, value: any) {
  if (op === 'in') {
    const set = new Set(Array.isArray(value) ? value : [value]);
    return (x: any) => set.has(x);
  }
  if (op === 'notIn') {
    const set = new Set(Array.isArray(value) ? value : [value]);
    return (x: any) => !set.has(x);
  }
  if (op === 'arrayContains') {
    return (x: any) => Array.isArray(x) && x.includes(value);
  }
  if (op === 'arrayIntersects') {
    const set = new Set(Array.isArray(value) ? value : [value]);
    return (x: any) => Array.isArray(x) && x.some(v => set.has(v));
  }
  return () => false;
}
export function softScore(op: string, x: any, value: any): number {
  if (!Array.isArray(x)) return 0;
  if (op === 'arrayIntersects') {
    const v = Array.isArray(value) ? value : [value];
    const inter = x.filter(it => v.includes(it)).length;
    return inter > 0 ? 1 : 0;
  }
  if (op === 'arrayContains') return x.includes(value) ? 1 : 0;
  return 0;
}
