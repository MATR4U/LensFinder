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

describe('setBoundsFromAvailability (non-snapping)', () => {
  it('does not auto-expand price/weight when user untouched', () => {
    const s = useFilterStore.getState();
    s.resetFilters();
    const before = useFilterStore.getState();
    s.setBoundsFromAvailability(caps);
    const { priceRange, weightRange, proPriceMax, proWeightMax } = useFilterStore.getState();
    // Ranges remain as-is (no auto expansion); caps are only advisory for UI
    expect(priceRange).toEqual(before.priceRange);
    expect(weightRange).toEqual(before.weightRange);
    // Max caps remain as-is
    expect(proPriceMax).toBe(before.proPriceMax);
    expect(proWeightMax).toBe(before.proWeightMax);
  });

  it('does not clamp when user has overridden ranges', () => {
    const s = useFilterStore.getState();
    s.resetFilters();
    s.setPriceRange({ min: 50, max: 3000 });
    s.setWeightRange({ min: 50, max: 3000 });
    // allow debounce timers to apply
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const before = useFilterStore.getState();
        s.setBoundsFromAvailability(caps);
        const { priceRange, weightRange } = useFilterStore.getState();
        // User-set ranges are preserved
        expect(priceRange).toEqual(before.priceRange);
        expect(weightRange).toEqual(before.weightRange);
        resolve();
      }, 250);
    });
  });
});


