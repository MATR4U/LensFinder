export const OPS = ['isTrue','isFalse'] as const;

export function cmpFactory(op: string, value: any) {
  if (op === 'isTrue') return (x: any) => x === true;
  if (op === 'isFalse') return (x: any) => x === false;
  return () => false;
}
export function softScore(op: string, x: any, value: any): number {
  if (op === 'isTrue') return x === true ? 1 : 0;
  if (op === 'isFalse') return x === false ? 1 : 0;
  return 0;
}
