import { describe, it, expect } from 'vitest';
import { makeResultsSelector } from '../src/lib/selectors';

const camera = {
  name: 'TestCam', brand: 'A', mount: 'E', ibis: false, price_chf: 1000, weight_g: 500, source_url: '',
  sensor: { name: 'FF', width_mm: 36, height_mm: 24, coc_mm: 0.03, crop: 1 },
};

const lenses = [
  { name: 'Prime 50', brand: 'A', mount: 'E', coverage: 'FF', focal_min_mm: 50, focal_max_mm: 50, aperture_min: 1.8, aperture_max: 16, weight_g: 300, ois: false, price_chf: 500, weather_sealed: true, is_macro: false, distortion_pct: 1, focus_breathing_score: 7, source_url: '' },
];

const f = {
  cameraName: 'Any', brand: 'Any', lensType: 'Any', sealed: false, isMacro: false,
  priceRange: { min: 0, max: 5000 }, weightRange: { min: 0, max: 2000 },
  proCoverage: 'Any', proFocalMin: 0, proFocalMax: 9999, proMaxApertureF: 99,
  proRequireOIS: false, proRequireSealed: false, proRequireMacro: false,
  proPriceMax: 5000, proWeightMax: 2000, proDistortionMaxPct: 100, proBreathingMinScore: 0,
  goalWeights: { low_light: 1 }, focalChoice: 50, isPro: true, subjectDistanceM: 3.0,
};

describe('makeResultsSelector smoke', () => {
  it('returns results without camera (falls back to FF sensor and computes score)', () => {
    const sel = makeResultsSelector();
    const res = sel(lenses as any, undefined as any, f);
    expect(res.length).toBe(1);
    expect(res[0].score_total).toBeGreaterThan(0);
  });

  it('returns scored results with camera', () => {
    const sel = makeResultsSelector();
    const res = sel(lenses as any, camera as any, f);
    expect(res.length).toBe(1);
    expect(res[0].score_total).toBeGreaterThanOrEqual(0);
  });
});


