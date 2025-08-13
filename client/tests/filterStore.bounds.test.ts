import { describe, it, expect } from 'vitest';
import { useFilterStore } from '../src/stores/filterStore';

const caps = {
  brands: ['Any', 'A'],
  lensTypes: ['Any', 'Prime', 'Zoom'],
  coverage: ['Any', 'FF'],
  priceBounds: { min: 100, max: 1000 },
  weightBounds: { min: 200, max: 2000 },
  focalBounds: { min: 10, max: 600 },
  apertureMaxMax: 22,
  distortionMaxMax: 5,
  breathingMinMin: 0,
} as const;

describe('setBoundsFromAvailability', () => {
  it('auto-expands price/weight when user untouched', () => {
    const s = useFilterStore.getState();
    s.resetFilters();
    s.setBoundsFromAvailability(caps);
    const { priceRange, weightRange, proPriceMax, proWeightMax } = useFilterStore.getState();
    expect(priceRange).toEqual(caps.priceBounds);
    expect(weightRange).toEqual(caps.weightBounds);
    expect(proPriceMax).toBe(caps.priceBounds.max);
    expect(proWeightMax).toBe(caps.weightBounds.max);
  });

  it('clamps when user has overridden ranges', () => {
    const s = useFilterStore.getState();
    s.resetFilters();
    s.setPriceRange({ min: 50, max: 3000 });
    s.setWeightRange({ min: 50, max: 3000 });
    // allow debounce timers to apply
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        s.setBoundsFromAvailability(caps);
        const { priceRange, weightRange } = useFilterStore.getState();
        expect(priceRange.min).toBeGreaterThanOrEqual(caps.priceBounds.min);
        expect(priceRange.max).toBeLessThanOrEqual(caps.priceBounds.max);
        expect(weightRange.min).toBeGreaterThanOrEqual(caps.weightBounds.min);
        expect(weightRange.max).toBeLessThanOrEqual(caps.weightBounds.max);
        resolve();
      }, 250);
    });
  });
});


