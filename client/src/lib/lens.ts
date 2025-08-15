import type { Lens } from '../types';

export function isPrime(lens: Pick<Lens, 'focal_min_mm' | 'focal_max_mm'>): boolean {
  return lens.focal_min_mm === lens.focal_max_mm;
}

export function isZoom(lens: Pick<Lens, 'focal_min_mm' | 'focal_max_mm'>): boolean {
  return lens.focal_min_mm !== lens.focal_max_mm;
}

export function formatFocalRange(lens: Pick<Lens, 'focal_min_mm' | 'focal_max_mm'>): string {
  return isPrime(lens) ? `${lens.focal_min_mm}mm` : `${lens.focal_min_mm}–${lens.focal_max_mm}mm`;
}


