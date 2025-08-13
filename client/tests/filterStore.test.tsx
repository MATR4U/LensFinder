import { act } from 'react';
import { useFilterStore } from '../src/stores/filterStore';

function flushTimers(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('useFilterStore sliders', () => {
  test('price and weight range setters debounce and clamp to caps', async () => {
    const setBoundsFromAvailability = useFilterStore.getState().setBoundsFromAvailability;
    act(() => {
      setBoundsFromAvailability({
        brands: ['Any'],
        lensTypes: ['Any', 'Prime', 'Zoom'],
        coverage: ['Any', 'FF'],
        priceBounds: { min: 200, max: 800 },
        weightBounds: { min: 100, max: 2000 },
        focalBounds: { min: 10, max: 600 },
        apertureMaxMax: 32,
        distortionMaxMax: 10,
        breathingMinMin: 0,
      });
    });

    // Set out-of-bounds values; they should clamp after debounce
    act(() => {
      useFilterStore.getState().setPriceRange({ min: 0, max: 5000 });
      useFilterStore.getState().setWeightRange({ min: -100, max: 99999 });
    });

    await flushTimers(250);

    const { priceRange, weightRange } = useFilterStore.getState();
    expect(priceRange.min).toBeGreaterThanOrEqual(200);
    expect(priceRange.max).toBeLessThanOrEqual(800);
    expect(weightRange.min).toBeGreaterThanOrEqual(100);
    expect(weightRange.max).toBeLessThanOrEqual(2000);
  });
});


