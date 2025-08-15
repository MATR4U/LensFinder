import type { Result } from '../types';

// Generate a stable, deterministic ID for a result. Uses name as prefix plus a short hash
// of other stable fields to avoid collisions when names repeat.
export function resultId(r: Result): string {
  const signature = [
    r.name,
    r.brand,
    r.mount,
    r.coverage,
    r.focal_min_mm,
    r.focal_max_mm,
    r.aperture_min,
    r.aperture_max,
    r.weight_g,
    r.price_chf,
    r.source_url
  ].join('|');
  let h = 5381;
  for (let i = 0; i < signature.length; i += 1) {
    h = ((h << 5) + h) ^ signature.charCodeAt(i);
  }
  const suffix = (h >>> 0).toString(36);
  return `${r.name}-${suffix}`;
}


