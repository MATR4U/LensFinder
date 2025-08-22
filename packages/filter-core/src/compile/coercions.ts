export function toNumber(v: any): number | undefined {
  if (v == null) return undefined;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}
export function toStringVal(v: any): string | undefined {
  if (v == null) return undefined;
  return String(v);
}
export function toBool(v: any): boolean | undefined {
  if (v == null) return undefined;
  if (typeof v === 'boolean') return v;
  if (v === 'true' || v === '1') return true;
  if (v === 'false' || v === '0') return false;
  return undefined;
}
