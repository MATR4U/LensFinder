export type Bounds = { min: number; max: number };
export type Range = { min: number; max: number };

export function withinCaps(value: number, bounds: Bounds): boolean {
  return value >= bounds.min && value <= bounds.max;
}

export function clampRangeToCaps(range: Range, bounds: Bounds): Range {
  const min = Math.max(bounds.min, Math.min(range.min, bounds.max));
  const max = Math.max(bounds.min, Math.min(range.max, bounds.max));
  if (min > max) return { min: bounds.min, max: bounds.min };
  return { min, max };
}


