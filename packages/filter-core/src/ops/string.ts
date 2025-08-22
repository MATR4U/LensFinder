export const OPS = ['eq','neq','includes','startsWith','endsWith','regex'] as const;

export function cmpFactory(op: string, value: any) {
  const v = String(value ?? '');
  if (op === 'eq') return (x: any) => String(x ?? '') === v;
  if (op === 'neq') return (x: any) => String(x ?? '') !== v;
  if (op === 'includes') return (x: any) => String(x ?? '').includes(v);
  if (op === 'startsWith') return (x: any) => String(x ?? '').startsWith(v);
  if (op === 'endsWith') return (x: any) => String(x ?? '').endsWith(v);
  if (op === 'regex') {
    const r = new RegExp(v);
    return (x: any) => r.test(String(x ?? ''));
  }
  return () => false;
}
export function softScore(op: string, x: any, value: any): number {
  if (op === 'eq') return String(x ?? '') === String(value ?? '') ? 1 : 0;
  if (op === 'includes') return String(x ?? '').includes(String(value ?? '')) ? 1 : 0;
  return 0;
}
