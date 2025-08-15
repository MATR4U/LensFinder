import React from 'react';
import { render } from '@testing-library/react';
import { useFilterStore } from '../../src/stores/filterStore';

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui);
}

export function resetStore() {
  const s = useFilterStore.getState();
  s.setBrand('Any');
  s.setLensType('Any');
  s.setSealed(false);
  s.setIsMacro(false);
  s.resetFilters();
}


