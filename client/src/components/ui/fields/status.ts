import type { FieldStatus } from './FieldContainer';

type Range = { min: number; max: number };

export function atBoundsStatus(args: { value: Range; min: number; max: number; currentStatus?: FieldStatus }): FieldStatus | undefined {
  const { value, min, max, currentStatus } = args;
  const atEdge = value.min <= min || value.max >= max;
  if (currentStatus && currentStatus !== 'normal') return currentStatus;
  return atEdge ? 'warning' : currentStatus;
}


