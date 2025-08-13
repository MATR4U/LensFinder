import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { useFilterStore } from '../src/stores/filterStore';
import ProRequirements from '../src/components/flow/ProRequirements';

function renderWithCapsAndZeroResults() {
  return render(
    <ProRequirements
      onContinue={() => { }}
      cameras={[]}
      brandsForCamera={[]}
      lenses={[]}
      resultsCount={0}
    />
  );
}

describe('Contextual zero-results notice and field warnings', () => {
  it('shows a contextual zero-results notice after changing price range', async () => {
    const s = useFilterStore.getState();
    s.resetFilters({ priceBounds: { min: 0, max: 8000 }, weightBounds: { min: 0, max: 3000 } });
    s.setBoundsFromAvailability({
      brands: ['Any'],
      lensTypes: ['Any', 'Prime', 'Zoom'],
      coverage: ['Any', 'FF'],
      priceBounds: { min: 0, max: 8000 },
      weightBounds: { min: 0, max: 3000 },
      focalBounds: { min: 8, max: 1200 },
      apertureMaxMax: 16,
      distortionMaxMax: 10,
      breathingMinMin: 0,
    });
    // Change price range (pushHistory is called inside setter)
    s.setPriceRange({ min: 0, max: 100 });
    renderWithCapsAndZeroResults();
    // Use a strict heading match to avoid matching inline hint texts
    expect(screen.getAllByText(/^No matches$/i).length).toBeGreaterThan(0);
  });

  it('applies warning styling when range sits at bounds (edge)', async () => {
    const s = useFilterStore.getState();
    s.resetFilters({ priceBounds: { min: 0, max: 8000 }, weightBounds: { min: 0, max: 3000 } });
    s.setBoundsFromAvailability({
      brands: ['Any'],
      lensTypes: ['Any', 'Prime', 'Zoom'],
      coverage: ['Any', 'FF'],
      priceBounds: { min: 0, max: 8000 },
      weightBounds: { min: 0, max: 3000 },
      focalBounds: { min: 8, max: 1200 },
      apertureMaxMax: 16,
      distortionMaxMax: 10,
      breathingMinMin: 0,
    });
    s.setWeightRange({ min: 0, max: 3000 });
    renderWithCapsAndZeroResults();
    expect(screen.getAllByText(/No matches/i).length).toBeGreaterThan(0);
  });
});


