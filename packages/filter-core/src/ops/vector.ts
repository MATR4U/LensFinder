export const OPS = ['cosineSimGte','dotGte','l2DistLte'] as const;

function dot(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}
function norm(a: number[]) {
  return Math.sqrt(dot(a, a));
}
export function cosineSim(a: number[], b: number[]) {
  const na = norm(a);
  const nb = norm(b);
  if (na === 0 || nb === 0) return 0;
  return dot(a, b) / (na * nb);
}
export function l2Dist(a: number[], b: number[]) {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}
export function cmpFactory(op: string, value: any) {
  if (op === 'cosineSimGte') {
    const v = Array.isArray(value?.vector) ? value.vector : value;
    const thr = typeof value?.threshold === 'number' ? value.threshold : 0;
    return (x: any) => Array.isArray(x) && cosineSim(x, v) >= thr;
  }
  if (op === 'dotGte') {
    const v = Array.isArray(value?.vector) ? value.vector : value;
    const thr = typeof value?.threshold === 'number' ? value.threshold : 0;
    return (x: any) => Array.isArray(x) && dot(x, v) >= thr;
  }
  if (op === 'l2DistLte') {
    const v = Array.isArray(value?.vector) ? value.vector : value;
    const thr = typeof value?.threshold === 'number' ? value.threshold : 0;
    return (x: any) => Array.isArray(x) && l2Dist(x, v) <= thr;
  }
  return () => false;
}
export function softScore(op: string, x: any, value: any): number {
  if (!Array.isArray(x)) return 0;
  if (op === 'cosineSimGte') {
    const v = Array.isArray(value?.vector) ? value.vector : value;
    return Math.max(0, cosineSim(x, v));
  }
  if (op === 'dotGte') {
    const v = Array.isArray(value?.vector) ? value.vector : value;
    return Math.max(0, dot(x, v));
  }
  if (op === 'l2DistLte') {
    const v = Array.isArray(value?.vector) ? value.vector : value;
    return 1 / (1 + l2Dist(x, v));
  }
  return 0;
}
