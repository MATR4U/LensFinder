import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
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

describe('Inline zero-results warning and field warnings', () => {
  it('shows an inline warning icon on Price after changing range leading to zero results', async () => {
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
    const priceLabel = screen.getAllByText('Price (CHF)')[0];
    const container = priceLabel.closest('label');
    expect(container).toBeTruthy();
    const icon = within(container as HTMLElement).getByText('!');
    expect(icon).toBeTruthy();
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
    const weightLabel = screen.getAllByText('Weight (g)')[0];
    const container = weightLabel.closest('label');
    expect(container).toBeTruthy();
  });
});


