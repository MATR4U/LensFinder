import { describe, it, expect } from 'vitest';
import { applyFilters } from '../src/lib/filters';

const lenses = [
  { name: 'Prime 50', brand: 'A', mount: 'E', coverage: 'FF', focal_min_mm: 50, focal_max_mm: 50, aperture_min: 1.8, aperture_max: 16, weight_g: 300, ois: false, price_chf: 500, weather_sealed: true, is_macro: false, distortion_pct: 1, focus_breathing_score: 7, source_url: '' },
  { name: 'Zoom 24-70', brand: 'A', mount: 'E', coverage: 'FF', focal_min_mm: 24, focal_max_mm: 70, aperture_min: 2.8, aperture_max: 2.8, weight_g: 800, ois: true, price_chf: 1500, weather_sealed: true, is_macro: false, distortion_pct: 2, focus_breathing_score: 8, source_url: '' },
];

const base = {
  cameraName: 'Any',
  cameraMount: undefined as string | undefined,
  brand: 'Any', lensType: 'Any', sealed: false, isMacro: false,
  priceRange: { min: 0, max: 5000 }, weightRange: { min: 0, max: 2000 },
  proCoverage: 'Any', proFocalMin: 0, proFocalMax: 9999, proMaxApertureF: 99,
  proRequireOIS: false, proRequireSealed: false, proRequireMacro: false,
  proPriceMax: 5000, proWeightMax: 2000, proDistortionMaxPct: 100, proBreathingMinScore: 0,
};

describe('applyFilters (black-box semantics)', () => {
  it('returns all lenses with broad defaults', () => {
    const out = applyFilters({ lenses, ...base });
    expect(out.length).toBe(2);
  });

  it('filters by lens type Prime', () => {
    const out = applyFilters({ lenses, ...base, lensType: 'Prime' });
    expect(out.map(l => l.name)).toEqual(['Prime 50']);
  });

  it('filters by price range upper bound', () => {
    const out = applyFilters({ lenses, ...base, priceRange: { min: 0, max: 1000 } });
    expect(out.map(l => l.name)).toEqual(['Prime 50']);
  });

  it('filters by OIS requirement', () => {
    const out = applyFilters({ lenses, ...base, proRequireOIS: true });
    expect(out.map(l => l.name)).toEqual(['Zoom 24-70']);
  });
});


